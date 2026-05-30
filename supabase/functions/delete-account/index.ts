// Supabase Edge Function — exclusão definitiva de conta (exigência App Store).
// Deploy: `supabase functions deploy delete-account`
//
// Verifica o JWT da usuária autenticada e, com a SERVICE ROLE, apaga o usuário
// de auth.users. Todas as tabelas referenciam profiles/auth.users com
// ON DELETE CASCADE (ver admin/supabase/schema.sql), então os dados owned são
// removidos junto.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: cors });

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) return new Response("Unauthorized", { status: 401, headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1) descobre quem é a usuária a partir do JWT dela
  const asUser = createClient(url, serviceRole, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await asUser.auth.getUser(jwt);
  if (userErr || !userData.user)
    return new Response("Unauthorized", { status: 401, headers: cors });

  // 2) apaga com service role (cascata remove os dados owned)
  const admin = createClient(url, serviceRole);
  const { error } = await admin.auth.admin.deleteUser(userData.user.id);
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
