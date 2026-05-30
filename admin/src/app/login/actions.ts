"use server";

import { redirect } from "next/navigation";
import { setAuthCookie, expectedPassword } from "@/lib/auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const expected = expectedPassword();
  if (expected === null) {
    return "Admin não configurado: defina ADMIN_PASSWORD no ambiente.";
  }
  const password = String(formData.get("password") ?? "");
  if (password !== expected) {
    return "Senha incorreta.";
  }
  await setAuthCookie();
  redirect("/");
}
