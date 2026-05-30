import "server-only";
import type {
  ContentGroup,
  Lead,
  Overview,
  UserDetail,
  UserRow,
} from "@/lib/types";
import { env, usingMock } from "@/lib/env";
import {
  mockContent,
  mockLeads,
  mockOverview,
  mockUserDetail,
  mockUsers,
} from "./mock";

export interface DataProvider {
  source: "mock" | "supabase";
  getOverview(): Promise<Overview>;
  listUsers(query?: string): Promise<UserRow[]>;
  getUser(id: string): Promise<UserDetail | null>;
  listLeads(): Promise<Lead[]>;
  listContent(): Promise<ContentGroup[]>;
}

/* --------------------------------- Mock --------------------------------- */

const mockProvider: DataProvider = {
  source: "mock",
  async getOverview() {
    return mockOverview();
  },
  async listUsers(query) {
    const all = mockUsers();
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  },
  async getUser(id) {
    return mockUserDetail(id);
  },
  async listLeads() {
    return mockLeads();
  },
  async listContent() {
    return mockContent();
  },
};

/* ------------------------------ Supabase ------------------------------ */

const PLAN_PRICE: Record<string, number> = { monthly: 39.9, annual: 199.9 / 12 };

function makeSupabaseProvider(): DataProvider {
  async function client() {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(env.supabase.url!, env.supabase.serviceRoleKey!, {
      auth: { persistSession: false },
    });
  }

  return {
    source: "supabase",
    async getOverview() {
      try {
        const sb = await client();
        const [{ count: users }, subs] = await Promise.all([
          sb.from("profiles").select("*", { count: "exact", head: true }),
          sb.from("subscriptions").select("plan,is_premium,renews_at"),
        ]);
        const premiumSubs = (subs.data ?? []).filter((s) => s.is_premium);
        const mrr = premiumSubs.reduce((sum, s) => sum + (PLAN_PRICE[s.plan] ?? 0), 0);
        const total = users ?? 0;
        const base = mockOverview();
        return {
          ...base,
          users: { value: total, delta: base.users.delta },
          premium: { value: premiumSubs.length, delta: base.premium.delta },
          mrr: { value: Math.round(mrr), delta: base.mrr.delta },
          conversion: {
            value: total ? premiumSubs.length / total : 0,
            delta: base.conversion.delta,
          },
        };
      } catch {
        return mockOverview(); // fallback enquanto o schema/dados não existem
      }
    },
    async listUsers(query) {
      try {
        const sb = await client();
        let q = sb
          .from("profiles")
          .select("id,name,email,created_at,subscriptions(plan,is_premium),journey_progress(current_day,challenge_type)")
          .limit(50);
        if (query) {
          // remove metacaracteres do PostgREST p/ evitar injeção no filtro .or()
          const safe = query.replace(/[,()*:%\\"']/g, "").trim().slice(0, 60);
          if (safe) q = q.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
        }
        const { data } = await q;
        if (!data) return mockUsers();
        return data.map((p: Record<string, unknown>) => mapUserRow(p));
      } catch {
        return mockUsers();
      }
    },
    async getUser(id) {
      try {
        return mockUserDetail(id); // detalhe rico: ligar às tabelas reais quando houver dados
      } catch {
        return mockUserDetail(id);
      }
    },
    async listLeads() {
      try {
        const sb = await client();
        const { data } = await sb
          .from("leads")
          .select("id,status,context,created_at,profiles(name,email)")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!data) return mockLeads();
        return data.map((l: Record<string, unknown>) => ({
          id: String(l.id),
          status: (l.status as Lead["status"]) ?? "novo",
          context: String(l.context ?? ""),
          createdAt: String(l.created_at),
          userName: ((l.profiles as { name?: string })?.name) ?? "—",
          userEmail: ((l.profiles as { email?: string })?.email) ?? "",
        }));
      } catch {
        return mockLeads();
      }
    },
    async listContent() {
      // Conteúdo migra pro banco quando o CMS estiver ativo; por ora, catálogo.
      return mockContent();
    },
  };
}

function mapUserRow(p: Record<string, unknown>): UserRow {
  // PostgREST devolve embeds 1:N como ARRAY — pega o primeiro registro.
  const first = <T,>(v: unknown): T | undefined =>
    Array.isArray(v) ? (v[0] as T) : (v as T | undefined);
  const sub = first<{ plan?: string; is_premium?: boolean }>(p.subscriptions) ?? {};
  const prog =
    first<{ current_day?: number; challenge_type?: string }>(p.journey_progress) ?? {};
  return {
    id: String(p.id),
    name: String(p.name ?? "—"),
    email: String(p.email ?? ""),
    plan: (sub.plan as UserRow["plan"]) ?? "free",
    isPremium: Boolean(sub.is_premium),
    currentDay: prog.current_day ?? 1,
    challengeType: prog.challenge_type ?? "main14",
    score: 0,
    streak: 0,
    lastActive: String(p.created_at ?? new Date().toISOString()),
    joinedAt: String(p.created_at ?? new Date().toISOString()),
  };
}

export function getProvider(): DataProvider {
  return usingMock ? mockProvider : makeSupabaseProvider();
}
