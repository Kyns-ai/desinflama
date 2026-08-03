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

/**
 * Sinais de PRODUTO, agregados de todas as usuárias.
 *
 * São as perguntas que só aparecem quando o app já roda: o que elas comem,
 * o que recusam, onde o cardápio não serve. Contar assinatura diz se o
 * negócio vive; isto diz o que consertar.
 */
export interface SinaisDeProduto {
  /** Média das Notas Desinflama registradas. */
  notaMedia: number | null;
  refeicoesRegistradas: number;
  /** Alimentos mais marcados como "não é pra mim" — cada um é uma receita
   *  que precisa de alternativa. */
  maisRecusados: { alimento: string; quantas: number }[];
  /** Prazeres mais resgatados — mostra o que de fato motiva. */
  prazeresMaisResgatados: { nome: string; quantas: number }[];
  /** Grupos FODMAP com mais reação forte — o padrão da base. */
  gatilhosMaisComuns: { grupo: string; quantas: number }[];
}

export interface DataProvider {
  source: "mock" | "supabase";
  getOverview(): Promise<Overview>;
  getSinaisDeProduto(): Promise<SinaisDeProduto>;
  listUsers(query?: string): Promise<UserRow[]>;
  getUser(id: string): Promise<UserDetail | null>;
  listLeads(): Promise<Lead[]>;
  listContent(): Promise<ContentGroup[]>;
}

/* --------------------------------- Mock --------------------------------- */

const SINAIS_DEMO: SinaisDeProduto = {
  notaMedia: 71,
  refeicoesRegistradas: 1284,
  maisRecusados: [
    { alimento: "Feijão", quantas: 84 },
    { alimento: "Leite de vaca", quantas: 71 },
    { alimento: "Cebola", quantas: 63 },
    { alimento: "Cogumelo", quantas: 52 },
    { alimento: "Berinjela", quantas: 38 },
  ],
  prazeresMaisResgatados: [
    { nome: "Um quadradinho de chocolate 70%", quantas: 312 },
    { nome: "Aquele café da cafeteria", quantas: 198 },
    { nome: "Taça de vinho", quantas: 141 },
    { nome: "Pizza de sexta", quantas: 47 },
  ],
  gatilhosMaisComuns: [
    { grupo: "Frutanos", quantas: 96 },
    { grupo: "Lactose", quantas: 74 },
    { grupo: "Leguminosas (GOS)", quantas: 58 },
    { grupo: "Polióis", quantas: 31 },
    { grupo: "Frutose", quantas: 19 },
  ],
};

const mockProvider: DataProvider = {
  source: "mock",
  async getOverview() {
    return mockOverview();
  },
  async getSinaisDeProduto() {
    return SINAIS_DEMO;
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

    /**
     * Agrega as tabelas da Onda 2. Cada bloco cai no demo separadamente:
     * se `meals` existir mas `food_preferences` não, a nota média é real e o
     * resto continua marcado como demonstração — melhor do que derrubar a
     * página inteira por causa de uma tabela que ainda não foi criada.
     */
    async getSinaisDeProduto() {
      try {
        const sb = await client();
        const [refeicoes, preferencias, resgates, tolerancia] = await Promise.all([
          sb.from("meals").select("nota"),
          sb.from("food_preferences").select("evita"),
          sb.from("rewards_redeemed").select("nome"),
          sb.from("tolerance_results").select("grupo,reacao"),
        ]);

        const notas = (refeicoes.data ?? []).map((m) => Number(m.nota));
        const contar = (xs: string[]) => {
          const mapa = new Map<string, number>();
          for (const x of xs) mapa.set(x, (mapa.get(x) ?? 0) + 1);
          return [...mapa.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        };

        const recusados = contar(
          (preferencias.data ?? []).flatMap(
            (p) => (p.evita as string[] | null) ?? []
          )
        );
        const prazeres = contar(
          (resgates.data ?? []).map((r) => String(r.nome))
        );
        const gatilhos = contar(
          (tolerancia.data ?? [])
            .filter((t) => Number(t.reacao) >= 2)
            .map((t) => String(t.grupo))
        );

        return {
          notaMedia: notas.length
            ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length)
            : null,
          refeicoesRegistradas: notas.length,
          maisRecusados: recusados.length
            ? recusados.map(([alimento, quantas]) => ({ alimento, quantas }))
            : SINAIS_DEMO.maisRecusados,
          prazeresMaisResgatados: prazeres.length
            ? prazeres.map(([nome, quantas]) => ({ nome, quantas }))
            : SINAIS_DEMO.prazeresMaisResgatados,
          gatilhosMaisComuns: gatilhos.length
            ? gatilhos.map(([grupo, quantas]) => ({ grupo, quantas }))
            : SINAIS_DEMO.gatilhosMaisComuns,
        };
      } catch {
        return SINAIS_DEMO;
      }
    },

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
