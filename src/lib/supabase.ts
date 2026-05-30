/**
 * Cliente Supabase (lazy). Só é criado quando as envs estão configuradas.
 * No app nativo (Capacitor) a sessão é persistida no storage padrão do
 * WebView; o redirect de OAuth social é tratado via deep-link (@capacitor/app).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let client: SupabaseClient | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!env.supabase.configured) return null;
  if (client) return client;
  const { createClient } = await import("@supabase/supabase-js");
  client = createClient(env.supabase.url!, env.supabase.anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
