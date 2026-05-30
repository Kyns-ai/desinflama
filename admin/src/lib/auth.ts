import "server-only";
import { cookies } from "next/headers";
import { env } from "./env";
import { DEMO_PASSWORD } from "./constants";

const COOKIE = "desinflama_admin";

export function expectedPassword(): string {
  return env.admin.password || DEMO_PASSWORD;
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "ok";
}

export async function setAuthCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
