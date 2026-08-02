/* Entrada do funil: a compra vira um código, o código vira acesso liberado. */

import { Hono } from "hono";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, producao } from "../env.js";
import { store, type RespostasFunil } from "../store.js";
import { gerarCodigo, gerarToken } from "../token.js";

export const rotasAcesso = new Hono();

/* ------------------------------------------------------------------ *
 *  POST /webhook/compra
 *  A plataforma de checkout chama aqui quando a compra é aprovada.
 *  Responde com o código de acesso — a página de obrigado monta o link:
 *    https://app.desinflama.com/entrar?c=CODIGO
 * ------------------------------------------------------------------ */

interface CorpoWebhook {
  nome?: string;
  email?: string;
  plano?: string;
  /** As respostas que o funil já coletou (opcional, mas é o que evita
   *  a cliente repetir as perguntas dentro do app). */
  respostas?: RespostasFunil;
  /** Formatos comuns das plataformas brasileiras — aceitamos vários. */
  customer?: { name?: string; email?: string };
  buyer?: { name?: string; email?: string };
  data?: Record<string, unknown>;
}

/**
 * Confere que o webhook veio mesmo da plataforma de checkout.
 *
 * Este endpoint LIBERA PRODUTO PAGO. Sem assinatura conferida, quem descobrisse
 * a URL geraria acesso premium à vontade. Por isso ele nunca "falha aberto" em
 * produção: sem segredo configurado, recusa tudo e explica no log. Em
 * desenvolvimento continua solto, para dar para testar sem cerimônia.
 */
function assinaturaConfere(corpoCru: string, recebida: string | undefined): boolean {
  if (!env.segredoWebhook) return !producao;
  if (!recebida) return false;

  const esperada = createHmac("sha256", env.segredoWebhook).update(corpoCru).digest("hex");
  const a = Buffer.from(recebida.replace(/^sha256=/, ""));
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

rotasAcesso.post("/webhook/compra", async (c) => {
  const corpoCru = await c.req.text();

  const assinatura =
    c.req.header("x-assinatura") ??
    c.req.header("x-signature") ??
    c.req.header("x-hub-signature-256");

  if (!assinaturaConfere(corpoCru, assinatura)) {
    return c.json({ erro: "assinatura inválida" }, 401);
  }

  let corpo: CorpoWebhook;
  try {
    corpo = JSON.parse(corpoCru) as CorpoWebhook;
  } catch {
    return c.json({ erro: "corpo não é JSON" }, 400);
  }

  const nome =
    corpo.nome ?? corpo.customer?.name ?? corpo.buyer?.name ?? "";
  const email =
    corpo.email ?? corpo.customer?.email ?? corpo.buyer?.email ?? "";

  if (!email) return c.json({ erro: "email é obrigatório" }, 400);

  const acesso = await store.criar({
    codigo: gerarCodigo(),
    nome: primeiroNome(nome),
    email: email.toLowerCase(),
    plano: corpo.plano ?? "annual",
    respostas: corpo.respostas ?? {},
  });

  return c.json({
    ok: true,
    codigo: acesso.codigo,
    // link pronto para a página de obrigado
    link: `/entrar?c=${acesso.codigo}`,
  });
});

/* ------------------------------------------------------------------ *
 *  POST /acesso/validar   { codigo }
 *  O app troca o código por um token e recebe tudo que já sabemos dela.
 * ------------------------------------------------------------------ */

rotasAcesso.post("/acesso/validar", async (c) => {
  const { codigo } = (await c.req.json().catch(() => ({}))) as { codigo?: string };
  if (!codigo || codigo.length < 4) return c.json({ erro: "código inválido" }, 400);

  const acesso = await store.porCodigo(codigo.trim());
  if (!acesso) return c.json({ erro: "código não encontrado" }, 404);

  // Ler ANTES de marcar: marcarAtivado altera o registro.
  const primeiraVez = acesso.ativadoEm === null;
  await store.marcarAtivado(acesso.id);

  return c.json({
    token: gerarToken(acesso.id),
    cliente: {
      nome: acesso.nome,
      email: acesso.email,
      plano: acesso.plano,
      respostas: acesso.respostas,
      primeiraVez,
    },
  });
});

function primeiroNome(completo: string): string {
  const limpo = completo.trim().replace(/\s+/g, " ");
  if (!limpo) return "";
  const primeiro = limpo.split(" ")[0]!;
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
}
