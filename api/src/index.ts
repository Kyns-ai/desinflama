/* Serviço desinflama-api.
 *
 * O app da cliente é um site estático — não tem servidor. Este serviço existe
 * para as três coisas que precisam de um: falar com a IA (a chave não pode
 * ficar no celular dela), receber o aviso de compra do checkout, e mandar
 * notificação. Roda separado, no Railway, sem mexer no app. */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { conferirConfiguracao, env, temIA } from "./env.js";
import { rotasAcesso } from "./rotas/acesso.js";
import { rotasIA } from "./rotas/ia.js";
import { usandoMemoria } from "./store.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origem) =>
      env.origensPermitidas.includes(origem) ? origem : env.origensPermitidas[0] ?? "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.get("/saude", (c) =>
  c.json({
    ok: true,
    ia: temIA ? env.anthropic.modelo : "não configurada",
    banco: usandoMemoria ? "memória (temporário)" : "supabase",
    limiteAnalisesDia: env.limiteAnalisesDia,
  }),
);

app.route("/", rotasAcesso);
app.route("/", rotasIA);

app.notFound((c) => c.json({ erro: "rota não encontrada" }, 404));

app.onError((erro, c) => {
  console.error("[erro]", erro);
  return c.json({ erro: "erro interno" }, 500);
});

const avisos = conferirConfiguracao();
if (avisos.length) {
  console.warn("\n--- atenção -------------------------------------------");
  for (const a of avisos) console.warn("  " + a);
  console.warn("-------------------------------------------------------\n");
}

serve({ fetch: app.fetch, port: env.porta }, (info) => {
  console.log(`desinflama-api no ar em http://localhost:${info.port}`);
});
