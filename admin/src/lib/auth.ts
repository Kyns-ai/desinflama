import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";
import { DEMO_PASSWORD } from "./constants";

const COOKIE = "desinflama_admin";

/** Em produção (Supabase configurado) exige ADMIN_PASSWORD — não cai no demo. */
export function adminConfigured(): boolean {
  return !env.supabase.configured || Boolean(env.admin.password);
}

/** Senha esperada, ou null quando há backend real sem ADMIN_PASSWORD (fail-closed). */
export function expectedPassword(): string | null {
  if (env.admin.password) return env.admin.password;
  return env.supabase.configured ? null : DEMO_PASSWORD;
}

/** Segredo para assinar o cookie (nunca o valor literal "ok", que seria forjável). */
function secret(): string {
  return (
    process.env.ADMIN_SECRET?.trim() ||
    env.admin.password ||
    env.supabase.serviceRoleKey ||
    DEMO_PASSWORD
  );
}

function token(): string {
  return crypto.createHmac("sha256", secret()).update("admin-v1").digest("hex");
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  if (!v) return false;
  const expected = token();
  const a = Buffer.from(v);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function setAuthCookie() {
  const jar = await cookies();
  jar.set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
