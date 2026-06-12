/**
 * Análises do Progresso — a "prova de resultado" (anti-reembolso).
 * Tudo derivado dos logs reais: séries por sintoma, melhores/piores dias,
 * correlação de gatilhos e marcos de melhora.
 */
import type { DailyLog, GutScorePoint, SymptomKey } from "@/types/domain";

export interface SeriesPoint {
  date: string;
  value: number;
}

const LOWER_IS_BETTER: SymptomKey[] = ["inchaco", "gases", "intestino"];

export function sortedLogs(logs: DailyLog[]): DailyLog[] {
  return [...logs].sort((a, b) => a.date.localeCompare(b.date));
}

/** Série de um sintoma ao longo do tempo (apenas dias com aquele sintoma). */
export function symptomSeries(
  logs: DailyLog[],
  key: SymptomKey
): SeriesPoint[] {
  return sortedLogs(logs)
    .filter((l) => l.symptoms[key] != null)
    .map((l) => ({ date: l.date, value: l.symptoms[key] as number }));
}

/** Série do Índice Intestinal — último ponto de cada dia. */
export function scoreSeries(scores: GutScorePoint[]): SeriesPoint[] {
  const byDay = new Map<string, number>();
  for (const p of scores) byDay.set(p.date, p.value);
  return [...byDay.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** "Desconforto" do dia (0 = ótimo). Menor é melhor. */
export function dayDiscomfort(log: DailyLog): number {
  let total = 0;
  let count = 0;
  for (const k of LOWER_IS_BETTER) {
    const v = log.symptoms[k];
    if (v != null) {
      total += v;
      count++;
    }
  }
  for (const k of ["energia", "pele"] as SymptomKey[]) {
    const v = log.symptoms[k];
    if (v != null) {
      total += 6 - v; // inverte: energia/pele baixas = mais desconforto
      count++;
    }
  }
  return count ? total / count : 3;
}

export interface DayRank {
  log: DailyLog;
  discomfort: number;
}

/** Melhor e pior dia (por desconforto), com o que foi comido. */
export function bestWorstDays(logs: DailyLog[]): {
  best: DayRank | null;
  worst: DayRank | null;
} {
  const ranked = logs
    .filter((l) => Object.keys(l.symptoms).length > 0)
    .map((l) => ({ log: l, discomfort: dayDiscomfort(l) }));
  if (ranked.length < 2) return { best: null, worst: null };
  const sorted = [...ranked].sort((a, b) => a.discomfort - b.discomfort);
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

/* ----------------------------- Gatilhos ----------------------------- */

export interface FoodGroup {
  label: string;
  test: RegExp;
}

// Heurística por palavra-chave (refinada na Fase 11 com listas FODMAP completas).
// Exportada: o micro-feedback do registro (foodFeedback.ts) usa a MESMA lista,
// senão o chip e o "suspeito da semana" se contradizem.
export const FOOD_GROUPS: FoodGroup[] = [
  { label: "laticínio", test: /\bleite\b|iogurte|queijo|requeij|nata\b/i },
  { label: "trigo/glúten", test: /p[ãa]o|trigo|macarr|massa|biscoito|bolacha/i },
  { label: "cebola ou alho", test: /cebola|alho/i },
  { label: "leguminosa", test: /feij[ãa]o|gr[ãa]o[- ]?de[- ]?bico|lentilha|soja/i },
  { label: "adoçante/diet", test: /adoçante|diet|sem açúcar|light/i },
];

export interface TriggerCorrelation {
  food: string;
  /** % dos piores dias que tinham esse alimento (0–1). */
  correlationStrength: number;
  occurrences: number;
}

/** Correlaciona alimentos com os piores dias (acima da mediana de desconforto). */
export function triggerInsights(logs: DailyLog[]): TriggerCorrelation[] {
  const withSymptoms = logs.filter((l) => Object.keys(l.symptoms).length > 0);
  if (withSymptoms.length < 4) return [];

  const discomforts = withSymptoms
    .map(dayDiscomfort)
    .sort((a, b) => a - b);
  const median = discomforts[Math.floor(discomforts.length / 2)];
  const badDays = withSymptoms.filter((l) => dayDiscomfort(l) > median);
  if (badDays.length === 0) return [];

  const results: TriggerCorrelation[] = [];
  for (const group of FOOD_GROUPS) {
    const inBad = badDays.filter((l) =>
      l.meals.some((m) => group.test.test(m.descricao))
    ).length;
    const totalWith = withSymptoms.filter((l) =>
      l.meals.some((m) => group.test.test(m.descricao))
    ).length;
    if (totalWith >= 2 && inBad >= 2) {
      results.push({
        food: group.label,
        correlationStrength: inBad / badDays.length,
        occurrences: totalWith,
      });
    }
  }
  return results.sort((a, b) => b.correlationStrength - a.correlationStrength);
}

/* ----------------------------- Marcos ----------------------------- */

export interface Milestone {
  label: string;
  emoji: string;
}

/** Marcos derivados da melhora real entre o início e agora. */
export function milestones(logs: DailyLog[], streakLongest: number): Milestone[] {
  const out: Milestone[] = [];
  const sorted = sortedLogs(logs);
  if (sorted.length >= 4) {
    for (const key of ["inchaco", "gases"] as SymptomKey[]) {
      const series = symptomSeries(sorted, key);
      if (series.length >= 4) {
        const firstAvg = avg(series.slice(0, 2).map((p) => p.value));
        const lastAvg = avg(series.slice(-2).map((p) => p.value));
        if (lastAvg < firstAvg) {
          const pct = Math.round(((firstAvg - lastAvg) / firstAvg) * 100);
          if (pct >= 10) {
            const label =
              key === "inchaco"
                ? `Reduziu o inchaço em ${pct}%`
                : `Reduziu os gases em ${pct}%`;
            out.push({ label, emoji: "🏆" });
          }
        }
      }
    }
    const energia = symptomSeries(sorted, "energia");
    if (energia.length >= 4) {
      const firstAvg = avg(energia.slice(0, 2).map((p) => p.value));
      const lastAvg = avg(energia.slice(-2).map((p) => p.value));
      if (lastAvg > firstAvg) out.push({ label: "Sua energia subiu 📈", emoji: "⚡" });
    }
  }
  if (streakLongest >= 3)
    out.push({ label: `Ofensiva recorde: ${streakLongest} dias`, emoji: "🔥" });
  return out;
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
