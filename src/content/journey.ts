/**
 * Conteúdo da jornada — Desafio Desincha (14 dias, framework 5R / Low FODMAP).
 *
 * NOTA DE FASE: o Dia 1 (abaixo) é conteúdo real, base do padrão de qualidade.
 * Os dias 2–14 são escritos na Fase 4 (Jornada) e a extensão 15–21, desafios
 * mensais, biblioteca de aulas/receitas e a validação com fontes (SOURCES.md)
 * vêm na Fase 11 (pesquisa). A nutricionista revisa e edita este arquivo.
 */
import type { JourneyPhase } from "@/types/domain";
import { phaseForDay } from "@/lib/journey";

export interface Swap {
  de: string;
  para: string;
}

export interface DayMeals {
  cafe: string[];
  almoco: string[];
  jantar: string[];
  lanche?: string[];
}

export interface DayContent {
  day: number;
  phase: JourneyPhase;
  lesson: { title: string; body: string };
  checklist: string[];
  meals: DayMeals;
  swaps?: Swap[];
  completionMessage: string;
}

export const DAYS: DayContent[] = [
  {
    day: 1,
    phase: "Choque",
    lesson: {
      title: "Por que você vive estufada (não é o quanto você come)",
      body: "O inchaço quase nunca é gordura ou “comer demais”. Na maioria das vezes é fermentação: certos carboidratos chegam ao intestino e viram comida pra bactérias, que produzem gás — e o gás estufa sua barriga, principalmente à noite. Nos próximos 3 dias a gente corta os maiores fermentadores pro seu intestino parar de produzir esse gás. Não é pra sempre — é pra acalmar agora e depois descobrir exatamente o que TE faz mal.",
    },
    checklist: [
      "Beba ~2L de água ao longo do dia",
      "Corte hoje: pão e trigo, leite e derivados, cebola e alho, refrigerante e adoçante, feijão e grão de bico",
      "Tempere com gengibre, limão e ervas",
      "Caminhe 15 min (movimenta o intestino)",
      "À noite, registre como se sentiu",
    ],
    meals: {
      cafe: [
        "Ovos mexidos + abacate + chá de gengibre",
        "Mamão + aveia sem glúten + chia",
        "Omelete de espinafre + café",
      ],
      almoco: [
        "Frango grelhado + arroz + abobrinha refogada",
        "Salmão + batata + cenoura assada",
        "Carne magra + arroz + salada de folhas com azeite e limão",
      ],
      jantar: [
        "Sopa de abóbora com gengibre",
        "Peixe grelhado + legumes no vapor",
        "Omelete + salada verde",
      ],
      lanche: ["Banana-da-terra cozida", "Um punhado de castanhas (até 10)", "Cenoura baby com homus de abobrinha"],
    },
    swaps: [
      { de: "cebola", para: "parte verde da cebolinha" },
      { de: "leite", para: "leite sem lactose ou bebida de arroz" },
      { de: "pão de trigo", para: "tapioca ou pão sem glúten" },
    ],
    completionMessage:
      "Dia 1 feito 🎉 Amanhã seu intestino já começa a desinflamar.",
  },
];

/** Acessa o conteúdo de um dia. Retorna null se ainda não foi escrito. */
export function getDay(day: number): DayContent | null {
  return DAYS.find((d) => d.day === day) ?? null;
}

/** Título da aula do dia, com fallback estrutural seguro (nunca vazio). */
export function lessonTitleFor(day: number): string {
  const d = getDay(day);
  if (d) return d.lesson.title;
  return `Aula do Dia ${day} · ${phaseForDay(day).phase}`;
}
