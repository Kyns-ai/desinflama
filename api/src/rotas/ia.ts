/* A Nutri IA: análise de foto e chat. Ambos em streaming (SSE). */

import { Hono, type Context } from "hono";
import { streamSSE } from "hono/streaming";
import type Anthropic from "@anthropic-ai/sdk";
import { env, temIA } from "../env.js";
import { store } from "../store.js";
import { lerToken } from "../token.js";
import {
  mensagemComFoto,
  responder,
  separarDados,
  tipoImagemValido,
} from "../ia.js";
import {
  ESTILOS,
  SUGESTOES_POR_FASE,
  systemChat,
  systemFoto,
  type ContextoCliente,
} from "../content/nutri.js";

export const rotasIA = new Hono();

/** Toda rota daqui exige o token que o app recebeu ao validar o código. */
async function autenticar(c: Context) {
  const header = c.req.header("authorization") ?? "";
  const conteudo = lerToken(header.replace(/^Bearer\s+/i, ""));
  if (!conteudo) return null;
  return store.porId(conteudo.acessoId);
}

interface CorpoFoto {
  imagem?: string; // base64 puro ou data URL
  tipo?: string; // image/jpeg ...
  contexto?: ContextoCliente;
}

rotasIA.post("/ia/foto", async (c) => {
  if (!temIA) return c.json({ erro: "IA não configurada no servidor" }, 503);

  const acesso = await autenticar(c);
  if (!acesso) return c.json({ erro: "acesso inválido" }, 401);

  const usadas = await store.analisesHoje(acesso.id);
  if (usadas >= env.limiteAnalisesDia) {
    return c.json(
      {
        erro: "limite diário",
        mensagem: `Você já fez ${usadas} análises hoje. Amanhã tem mais — e o chat continua liberado.`,
        limite: env.limiteAnalisesDia,
      },
      429,
    );
  }

  const corpo = (await c.req.json().catch(() => ({}))) as CorpoFoto;
  const bruta = corpo.imagem ?? "";
  const base64 = bruta.includes(",") ? bruta.slice(bruta.indexOf(",") + 1) : bruta;
  const tipo = corpo.tipo ?? "image/jpeg";

  if (!base64) return c.json({ erro: "imagem ausente" }, 400);
  if (!tipoImagemValido(tipo)) return c.json({ erro: "formato de imagem não aceito" }, 400);
  // ~7MB em base64 ≈ 5MB de arquivo: acima disso a análise fica lenta e cara.
  if (base64.length > 7_000_000) return c.json({ erro: "imagem muito grande" }, 413);

  const ctx: ContextoCliente = { nome: acesso.nome, ...(corpo.contexto ?? {}) };
  await store.registrarAnalise(acesso.id);

  return streamSSE(c, async (fluxo) => {
    try {
      const resultado = await responder({
        system: systemFoto(ctx),
        messages: mensagemComFoto(
          base64,
          tipo,
          "Olha essa refeição e me diz o que ela faz com o meu inchaço.",
        ),
        maxTokens: 900,
        aoReceber: (pedaco) => {
          // Segura o bloco de dados: ele é para o app, não para ela ler.
          void fluxo.writeSSE({ event: "texto", data: JSON.stringify(pedaco) });
        },
      });

      const { texto, dados } = separarDados(resultado.textoCompleto);
      await fluxo.writeSSE({
        event: "fim",
        data: JSON.stringify({
          texto,
          dados,
          restantesHoje: Math.max(0, env.limiteAnalisesDia - usadas - 1),
          uso: resultado.uso,
        }),
      });
    } catch (erro) {
      await fluxo.writeSSE({
        event: "erro",
        data: JSON.stringify({ mensagem: mensagemDeErro(erro) }),
      });
    }
  });
});

interface CorpoChat {
  mensagens?: { autor: "cliente" | "nutri"; texto: string }[];
  contexto?: ContextoCliente;
}

rotasIA.post("/ia/chat", async (c) => {
  if (!temIA) return c.json({ erro: "IA não configurada no servidor" }, 503);

  const acesso = await autenticar(c);
  if (!acesso) return c.json({ erro: "acesso inválido" }, 401);

  const corpo = (await c.req.json().catch(() => ({}))) as CorpoChat;
  const historico = (corpo.mensagens ?? []).slice(-12); // últimas 12 falas bastam
  if (!historico.length) return c.json({ erro: "sem mensagem" }, 400);

  const messages: Anthropic.MessageParam[] = historico.map((m) => ({
    role: m.autor === "cliente" ? "user" : "assistant",
    content: m.texto,
  }));

  const ctx: ContextoCliente = { nome: acesso.nome, ...(corpo.contexto ?? {}) };

  return streamSSE(c, async (fluxo) => {
    try {
      const resultado = await responder({
        system: systemChat(ctx),
        messages,
        maxTokens: 700,
        aoReceber: (pedaco) => {
          void fluxo.writeSSE({ event: "texto", data: JSON.stringify(pedaco) });
        },
      });

      await fluxo.writeSSE({
        event: "fim",
        data: JSON.stringify({
          texto: resultado.textoCompleto,
          sugestoes: SUGESTOES_POR_FASE[ctx.fase ?? ""] ?? [],
          uso: resultado.uso,
        }),
      });
    } catch (erro) {
      await fluxo.writeSSE({
        event: "erro",
        data: JSON.stringify({ mensagem: mensagemDeErro(erro) }),
      });
    }
  });
});

/** Estilos disponíveis, para a tela de escolha no Dia 0. */
rotasIA.get("/ia/estilos", (c) =>
  c.json(
    Object.entries(ESTILOS).map(([id, e]) => ({
      id,
      titulo: e.titulo,
      descricao: e.descricao,
    })),
  ),
);

function mensagemDeErro(erro: unknown): string {
  const texto = erro instanceof Error ? erro.message : String(erro);
  if (/rate|429/i.test(texto)) {
    return "Estou com muita gente falando comigo agora. Tenta de novo em alguns segundos.";
  }
  if (/timeout|ETIMEDOUT|ECONNRESET/i.test(texto)) {
    return "A conexão caiu no meio. Tenta mandar de novo?";
  }
  return "Deu um problema aqui do meu lado. Tenta de novo em instantes.";
}
