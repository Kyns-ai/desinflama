/**
 * Relatório da Semana — o artefato de progresso (padrão "relatório de ciclo"
 * da Flo). Agrega os registros reais da semana num resumo que a usuária SENTE:
 * mesmo sem atingir o objetivo final, ela vê o que o corpo já contou.
 */
import type { DailyLog, GutScorePoint } from "@/types/domain";
import { addDays, diffDays, todayKey } from "./date";
import {
  dayDiscomfort,
  symptomSeries,
  scoreSeries,
  triggerInsights,
  type TriggerCorrelation,
} from "./analytics";

export interface WeeklyRecap {
  /** 1 = primeira semana do programa. */
  week: number;
  /** YYYY-MM-DD de início e fim da janela. */
  start: string;
  end: string;
  /** Dias com registro na semana (0–7). */
  daysLogged: number;
  /** Variação % do inchaço (negativo = melhorou). Null se faltam dados. */
  inchacoChangePct: number | null;
  /** Variação % da energia (positivo = melhorou). Null se faltam dados. */
  energiaChangePct: number | null;
  /** Melhor dia da semana, com o que foi comido. */
  bestDay: { date: string; meals: string[] } | null;
  /** Gatilho mais suspeito da semana (se houver dados suficientes). */
  suspect: TriggerCorrelation | null;
  /** Índice no início e fim da semana. */
  scoreStart: number | null;
  scoreEnd: number | null;
}

function changePct(series: { value: number }[]): number | null {
  if (series.length < 3) return null;
  // janelas sem sobreposição: com 3 pontos compara 1º vs último, não dilui
  const w = Math.min(2, Math.floor(series.length / 2));
  const head = series.slice(0, w);
  const tail = series.slice(-w);
  const first = head.reduce((a, p) => a + p.value, 0) / head.length;
  const last = tail.reduce((a, p) => a + p.value, 0) / tail.length;
  if (first === 0) return null;
  return Math.round(((last - first) / first) * 100);
}

/**
 * Data local (YYYY-MM-DD) do início do programa. startedAt é ISO/UTC; os logs
 * usam todayKey() local — cortar a string ISO deslocaria a semana em 1 dia
 * para quem começa à noite (UTC-3).
 */
function startKeyOf(startedAt: string): string {
  return todayKey(new Date(startedAt));
}

/**
 * Monta o recap da semana `week` (1-based) a partir da data de início do
 * programa. Retorna null se houver menos de 3 dias registrados — sem dado,
 * sem relatório inflado.
 */
export function weeklyRecap(
  logs: DailyLog[],
  scores: GutScorePoint[],
  startedAt: string,
  week: number
): WeeklyRecap | null {
  const startKey = startKeyOf(startedAt);
  const start = addDays(startKey, (week - 1) * 7);
  const end = addDays(start, 6);

  const inWindow = logs.filter(
    (l) => diffDays(l.date, start) >= 0 && diffDays(l.date, end) <= 0
  );
  const withSymptoms = inWindow.filter(
    (l) => Object.keys(l.symptoms).length > 0
  );
  if (withSymptoms.length < 3) return null;

  const ranked = withSymptoms
    .map((l) => ({ log: l, discomfort: dayDiscomfort(l) }))
    .sort((a, b) => a.discomfort - b.discomfort);
  const best = ranked[0] ?? null;

  const scorePoints = scoreSeries(scores).filter(
    (p) => diffDays(p.date, start) >= 0 && diffDays(p.date, end) <= 0
  );

  return {
    week,
    start,
    end,
    daysLogged: inWindow.length,
    inchacoChangePct: changePct(symptomSeries(inWindow, "inchaco")),
    energiaChangePct: changePct(symptomSeries(inWindow, "energia")),
    bestDay: best
      ? {
          date: best.log.date,
          meals: best.log.meals.map((m) => m.descricao).slice(0, 3),
        }
      : null,
    suspect: triggerInsights(inWindow)[0] ?? null,
    scoreStart: scorePoints[0]?.value ?? null,
    scoreEnd: scorePoints[scorePoints.length - 1]?.value ?? null,
  };
}

/**
 * Quantas semanas do programa já FECHARAM no calendário (0 = nenhuma).
 * Base calendário, não currentDay: currentDay trava no fim do programa (14/21),
 * o que faria a última semana — a do "gatilhos mapeados" — nunca fechar.
 */
export function closedWeeks(
  startedAt: string,
  today: string = todayKey()
): number {
  const elapsed = diffDays(today, startKeyOf(startedAt));
  return Math.max(0, Math.min(12, Math.floor(elapsed / 7)));
}

/** Última semana fechada com dados suficientes (para a seção do Progresso). */
export function latestRecap(
  logs: DailyLog[],
  scores: GutScorePoint[],
  startedAt: string
): WeeklyRecap | null {
  for (let w = closedWeeks(startedAt); w >= 1; w--) {
    const r = weeklyRecap(logs, scores, startedAt, w);
    if (r) return r;
  }
  return null;
}
