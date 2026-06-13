/**
 * Cardápio da semana — transforma as opções soltas dos dias num menu escaneável
 * seg–dom, com a opção "principal" em destaque e as outras como variações. Não
 * reescreve conteúdo; reorganiza o que já existe em journey.ts numa "dieta".
 */
import { getDay, type DayMeals } from "@/content/journey";
import { phaseForDay } from "@/lib/journey";
import { RECIPES, recipesByPhase, type Recipe } from "@/content/recipes";
import type { JourneyPhase } from "@/types/domain";

export const WEEKS = [
  { week: 1, label: "Semana 1", days: [1, 2, 3, 4, 5, 6, 7] },
  { week: 2, label: "Semana 2", days: [8, 9, 10, 11, 12, 13, 14] },
  { week: 3, label: "Semana 3 (Reset)", days: [15, 16, 17, 18, 19, 20, 21] },
] as const;

const WEEKDAY = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export interface DayMenu {
  day: number;
  weekday: string;
  cafe: string[];
  almoco: string[];
  jantar: string[];
  lanche: string[];
}

export function menuForWeek(week: number): DayMenu[] {
  const w = WEEKS.find((x) => x.week === week) ?? WEEKS[0];
  return w.days
    .map((day, i): DayMenu | null => {
      const content = getDay(day);
      if (!content) return null;
      const m: DayMeals = content.meals;
      return {
        day: day as number,
        weekday: WEEKDAY[i],
        cafe: m.cafe ?? [],
        almoco: m.almoco ?? [],
        jantar: m.jantar ?? [],
        lanche: m.lanche ?? [],
      };
    })
    .filter((x): x is DayMenu => x !== null);
}

/** Fases cobertas por uma semana (para puxar as receitas certas). */
export function phasesOfWeek(week: number): JourneyPhase[] {
  const w = WEEKS.find((x) => x.week === week) ?? WEEKS[0];
  const set = new Set<JourneyPhase>();
  for (const d of w.days) set.add(phaseForDay(d, "reset21").phase);
  return [...set];
}

/** Receitas das fases de uma semana (fonte da lista de compras). */
export function recipesForWeek(week: number): Recipe[] {
  const phases = phasesOfWeek(week);
  const seen = new Set<string>();
  const out: Recipe[] = [];
  for (const p of phases) {
    for (const r of recipesByPhase(p)) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        out.push(r);
      }
    }
  }
  // garante algo mesmo se uma fase não tiver receita
  return out.length ? out : RECIPES.slice(0, 6);
}
