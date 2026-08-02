/* Conversa com a Anthropic. Duas funções: chat e análise de foto.
 *
 * Decisões que valem explicação:
 *  - O texto grande e fixo da nutri vai no `system` com cache ligado. A partir
 *    da segunda chamada ele custa ~10% do preço, o que derruba a conta.
 *  - `effort: low` porque as respostas são curtas e a cliente está esperando
 *    na tela. Qualidade continua ótima e a latência cai bastante.
 *  - Streaming sempre: a resposta aparece aparecendo, como no WhatsApp, em vez
 *    de uma bolinha girando por 8 segundos.
 *  - Se o modelo recusar responder (acontece raramente, por classificador de
 *    segurança), tentamos uma vez no modelo reserva antes de desistir. */

import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env.js";

export const anthropic = new Anthropic({ apiKey: env.anthropic.chave });

export interface UsoTokens {
  entrada: number;
  saida: number;
  cacheLido: number;
  cacheEscrito: number;
  /** custo estimado em dólar, para o painel admin */
  custoUsd: number;
}

/** Preço por milhão de tokens (entrada, saída). Atualizar se mudar o modelo. */
const PRECOS: Record<string, [number, number]> = {
  "claude-opus-5": [5, 25],
  "claude-opus-4-8": [5, 25],
  "claude-sonnet-5": [3, 15],
  "claude-haiku-4-5": [1, 5],
};

function calcularCusto(modelo: string, u: Omit<UsoTokens, "custoUsd">): number {
  const [entrada, saida] = PRECOS[modelo] ?? [5, 25];
  // Cache lido custa ~10% da entrada; cache escrito ~125%.
  const tokensEntradaEquivalente =
    u.entrada + u.cacheLido * 0.1 + u.cacheEscrito * 1.25;
  return (tokensEntradaEquivalente / 1e6) * entrada + (u.saida / 1e6) * saida;
}

export interface OpcoesIA {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  /** chamada a cada pedacinho de texto que chega */
  aoReceber: (texto: string) => void;
}

export interface ResultadoIA {
  textoCompleto: string;
  uso: UsoTokens;
  modelo: string;
  recusado: boolean;
}

async function executar(
  modelo: string,
  { system, messages, maxTokens = 1024, aoReceber }: OpcoesIA,
): Promise<ResultadoIA> {
  // O SDK ainda não tipa `output_config`; o parâmetro é válido na API.
  const params = {
    model: modelo,
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
    output_config: { effort: "low" },
  } as unknown as Anthropic.MessageStreamParams;

  const stream = anthropic.messages.stream(params);

  let texto = "";
  for await (const evento of stream) {
    if (
      evento.type === "content_block_delta" &&
      evento.delta.type === "text_delta"
    ) {
      texto += evento.delta.text;
      aoReceber(evento.delta.text);
    }
  }

  const final = await stream.finalMessage();
  const u = final.usage;
  const semCusto = {
    entrada: u.input_tokens ?? 0,
    saida: u.output_tokens ?? 0,
    cacheLido: u.cache_read_input_tokens ?? 0,
    cacheEscrito: u.cache_creation_input_tokens ?? 0,
  };

  return {
    textoCompleto: texto,
    modelo,
    recusado: final.stop_reason === "refusal",
    uso: { ...semCusto, custoUsd: calcularCusto(modelo, semCusto) },
  };
}

/** Executa e, se o modelo principal recusar sem ter escrito nada, tenta o reserva. */
export async function responder(opcoes: OpcoesIA): Promise<ResultadoIA> {
  const primeiro = await executar(env.anthropic.modelo, opcoes);
  if (!primeiro.recusado || primeiro.textoCompleto.length > 0) return primeiro;

  const reserva = await executar(env.anthropic.modeloReserva, opcoes);
  return reserva;
}

/* ----------------------------- foto de comida ---------------------------- */

const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type TipoImagem = (typeof TIPOS_IMAGEM)[number];

export function tipoImagemValido(t: string): t is TipoImagem {
  return (TIPOS_IMAGEM as readonly string[]).includes(t);
}

export function mensagemComFoto(
  base64: string,
  tipo: TipoImagem,
  pergunta: string,
): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: tipo, data: base64 },
        },
        { type: "text", text: pergunta },
      ],
    },
  ];
}

/** Separa o texto que a cliente lê dos dados estruturados do fim da resposta. */
export function separarDados(resposta: string): {
  texto: string;
  dados: Record<string, unknown> | null;
} {
  const marca = resposta.lastIndexOf("<<<DADOS>>>");
  if (marca === -1) return { texto: resposta.trim(), dados: null };

  const texto = resposta.slice(0, marca).trim();
  const cru = resposta.slice(marca + "<<<DADOS>>>".length).trim();
  try {
    return { texto, dados: JSON.parse(cru) as Record<string, unknown> };
  } catch {
    return { texto, dados: null };
  }
}
