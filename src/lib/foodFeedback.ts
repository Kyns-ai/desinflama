/**
 * Micro-feedback imediato ao anotar comida (padrão "Vitamin Boost" do Yazio):
 * cada registro responde NA HORA, transformando o log em conversa. Tom
 * anti-culpa — anotar um gatilho é dado valioso pro mapa, nunca fracasso.
 *
 * Os gatilhos vêm das MESMAS fontes do resto do app (semáforo + FOOD_GROUPS do
 * analytics), para o chip nunca contradizer o "suspeito da semana".
 */
import { SEMAFORO, type Tier } from "@/content/semaforo";
import { FOOD_GROUPS } from "./analytics";
import { stripAccents } from "./text";

export interface FoodFeedback {
  tier: Tier | "neutro";
  message: string;
}

/** Palavras-chave por tier, derivadas do semáforo (nome sem parênteses, split em "/"). */
function keywordsOf(nome: string): string[] {
  return nome
    .replace(/\(.*?\)/g, "")
    .split("/")
    .map((k) => stripAccents(k.trim().toLowerCase()))
    .filter((k) => k.length >= 3);
}

/** Casa por palavra inteira: "mel" não pode acender em "omelete". */
function wordRegex(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z])${escaped}(?![a-z])`);
}

const TIER_KEYWORDS: Array<{ tier: Tier; test: RegExp; nome: string }> =
  SEMAFORO.flatMap((t) =>
    t.foods.flatMap((f) =>
      keywordsOf(f.nome).map((keyword) => ({
        tier: t.tier,
        test: wordRegex(keyword),
        nome: f.nome.replace(/\(.*?\)/g, "").split("/")[0].trim(),
      }))
    )
  );

// Versões seguras de gatilhos clássicos — não acusar a troca recomendada.
const SAFE_EXCEPTIONS =
  /(leite|iogurte|queijo|pao|p[ãa]o) (sem lactose|sem gluten|sem glúten|de coco|de amendoa|de amendoas|de amêndoas|de aveia|de arroz|de castanha|vegetal)/;

// Gatilhos clássicos além do semáforo/analytics (testados no texto normalizado).
const EXTRA_INFLAMA: Array<{ test: RegExp; nome: string }> = [
  { test: /pizza|salgado|refrigerante|cerveja|chiclete/, nome: "Esse item" },
];

/** Avalia o texto de uma refeição e devolve o feedback do chip. */
export function foodFeedback(descricao: string): FoodFeedback {
  const text = stripAccents(descricao.toLowerCase());
  const safe = SAFE_EXCEPTIONS.test(text);

  const hits = TIER_KEYWORDS.filter((k) => k.test.test(text));
  const atencao = hits.find((h) => h.tier === "atencao");
  const calma = hits.find((h) => h.tier === "calma");
  // o semáforo (lista curada) tem precedência; FOOD_GROUPS/extras só entram
  // quando o semáforo não reconheceu nada — senão "iogurte" (Atenção) viraria
  // "laticínio inflama" e o chip contradiria a tela do semáforo.
  const inflama = safe
    ? undefined
    : (hits.find((h) => h.tier === "inflama") ??
      (hits.length === 0
        ? (FOOD_GROUPS.filter((g) => g.test.test(descricao)).map((g) => ({
            nome: g.label,
          }))[0] ?? EXTRA_INFLAMA.find((e) => e.test.test(text)))
        : undefined));

  if (inflama)
    return {
      tier: "inflama",
      message: `Anotado — ${inflama.nome.toLowerCase()} é um dos suspeitos clássicos. Seu mapa agradece 🔍`,
    };
  if (atencao && !safe)
    return {
      tier: "atencao",
      message: `Anotado! ${atencao.nome} depende da porção — observa como seu corpo responde.`,
    };
  if (calma || safe)
    return {
      tier: "calma",
      message: "Boost anti-inflamatório! Escolha que costuma cair bem 💚",
    };
  return { tier: "neutro", message: "Anotado!" };
}
