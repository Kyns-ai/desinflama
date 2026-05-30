"use server";

import { redirect } from "next/navigation";
import { setAuthCookie, expectedPassword } from "@/lib/auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  if (password !== expectedPassword()) {
    return "Senha incorreta.";
  }
  await setAuthCookie();
  redirect("/");
}
