/**
 * Mapa de Tolerância — o entregável central do método 5R. A reintrodução (dias
 * 8–11) testa um grupo FODMAP por vez; cada teste vira uma peça do mapa pessoal
 * "o que eu tolero / modero / evito". Honesto: grupo sem teste = "a descobrir".
 */
import type {
  ReintroGroup,
  ReactionLevel,
  ToleranceResult,
} from "@/types/domain";

export interface ReintroGroupDef {
  group: ReintroGroup;
  nome: string;
  emoji: string;
  /** O que o grupo representa, em 1 linha. */
  resumo: string;
  /** Exemplos de alimentos do grupo. */
  exemplos: string;
  /** Dia padrão da jornada em que é testado. */
  defaultDay: number;
}

export const REINTRO_GROUPS: ReintroGroupDef[] = [
  {
    group: "lactose",
    nome: "Lactose",
    emoji: "🥛",
    resumo: "O açúcar do leite e derivados.",
    exemplos: "leite e iogurte comuns, queijos frescos, sorvete",
    defaultDay: 8,
  },
  {
    group: "frutose",
    nome: "Frutose",
    emoji: "🍯",
    resumo: "O açúcar de algumas frutas e do mel.",
    exemplos: "mel, manga, melancia, maçã",
    defaultDay: 9,
  },
  {
    group: "frutanos",
    nome: "Frutanos",
    emoji: "🧅",
    resumo: "A fibra do trigo, da cebola e do alho.",
    exemplos: "pão e massa de trigo, cebola, alho",
    defaultDay: 10,
  },
  {
    group: "gos",
    nome: "Leguminosas (GOS)",
    emoji: "🫘",
    resumo: "A fibra das leguminosas.",
    exemplos: "feijão, grão-de-bico, lentilha",
    defaultDay: 11,
  },
  {
    group: "polioles",
    nome: "Polióis",
    emoji: "🍎",
    resumo: "Adoçantes diet e algumas frutas/legumes.",
    exemplos: "adoçante sem açúcar, couve-flor, cogumelo, pera",
    defaultDay: 11,
  },
];

/** Dia da jornada → grupo(s) testável(is). Dia 11 oferece escolha (GOS ou polióis). */
export const DAY_TO_GROUPS: Record<number, ReintroGroup[]> = {
  8: ["lactose"],
  9: ["frutose"],
  10: ["frutanos"],
  11: ["gos", "polioles"],
};

export function groupDef(group: ReintroGroup): ReintroGroupDef {
  return REINTRO_GROUPS.find((g) => g.group === group)!;
}

/** Os 4 níveis de reação que ela registra. */
export const REACTIONS: {
  level: ReactionLevel;
  label: string;
  emoji: string;
}[] = [
  { level: 0, label: "Tolerei bem", emoji: "😌" },
  { level: 1, label: "Reação leve", emoji: "🙂" },
  { level: 2, label: "Moderada", emoji: "😕" },
  { level: 3, label: "Forte", emoji: "😣" },
];

export type Verdict = "avontade" | "moderar" | "evitar" | "naotestado";

export const VERDICT_LABEL: Record<Verdict, string> = {
  avontade: "Tolera à vontade",
  moderar: "Com moderação",
  evitar: "Evitar por enquanto",
  naotestado: "Ainda não testou",
};

/** Veredito de um grupo, derivado do teste MAIS RECENTE (o mapa é vivo). */
export function verdictFor(
  group: ReintroGroup,
  results: ToleranceResult[]
): Verdict {
  const last = [...results]
    .filter((r) => r.group === group)
    .sort((a, b) => b.dateTested.localeCompare(a.dateTested))[0];
  if (!last) return "naotestado";
  if (last.reaction === 0) return "avontade";
  if (last.reaction === 1) return "moderar";
  return "evitar";
}

/** Quantos grupos já foram testados (para progresso "3 de 5"). */
export function testedCount(results: ToleranceResult[]): number {
  return new Set(results.map((r) => r.group)).size;
}
