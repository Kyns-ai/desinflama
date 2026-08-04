import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";
import { DEMO_PASSWORD } from "./constants";

const COOKIE = "desinflama_admin";

/**
 * A senha de demonstração SÓ existe fora de produção.
 *
 * A regra anterior era "fail-closed quando o Supabase está configurado" — o
 * que deixava um buraco exato: subir o admin em modo mock (sem Supabase), que
 * é justamente o estado de hoje, abria o painel na internet com a senha
 * `desinflama` para quem descobrisse a URL. O gatilho certo não é "tem
 * backend?", é "está publicado?".
 *
 * Em produção sem ADMIN_PASSWORD o painel não abre para ninguém, de propósito:
 * é melhor um deploy que não entra do que um painel aberto.
 */
const EM_PRODUCAO = process.env.NODE_ENV === "production";

export function adminConfigured(): boolean {
  return !EM_PRODUCAO || Boolean(env.admin.password);
}

/** Senha esperada, ou null quando está publicado sem ADMIN_PASSWORD. */
export function expectedPassword(): string | null {
  if (env.admin.password) return env.admin.password;
  return EM_PRODUCAO ? null : DEMO_PASSWORD;
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
