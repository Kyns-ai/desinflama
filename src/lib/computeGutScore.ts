/**
 * Motor do Índice Intestinal (Fase 8). Função pura + recomputação diária a partir do
 * estado real. Substitui os incrementos ad-hoc: cada dia tem UM ponto, recalculado
 * quando a usuária conclui o dia ou registra.
 *
 * Regra crítica: o score NUNCA despenca. Quedas são suaves (teto de queda por
 * dia) e disparam mensagem de ajuda — frustrar leva à desistência.
 */
import type { AppData, DailyLog, GutScorePoint } from "@/types/domain";
import { initialScore } from "./score";
import { dayDiscomfort } from "./analytics";
import { todayKey } from "./date";

export interface ScoreWeights {
  completeDay: number;
  register: number;
  hydration: number;
  streakPerDay: number;
  streakCap: number;
  trendMax: number; // ganho máximo por tendência de melhora
  worsenMax: number; // perda máxima por piora (suave)
  maxDailyDrop: number; // anti-despenque: queda máxima por dia
}

export const SCORE_WEIGHTS: ScoreWeights = {
  completeDay: 8,
  register: 4,
  hydration: 2,
  streakPerDay: 1,
  streakCap: 7,
  trendMax: 5,
  worsenMax: 3,
  maxDailyDrop: 3,
};

export interface DayScoreInput {
  prevValue: number;
  todayLog?: DailyLog;
  dayCompletedToday: boolean;
  streakCurrent: number;
  /** desconforto médio dos últimos dias registrados (para tendência). */
  recentDiscomfort: number | null;
}

/** Calcula o valor/delta do Índice Intestinal de um dia. Pura e testável. */
export function computeDayScore(
  input: DayScoreInput,
  w: ScoreWeights = SCORE_WEIGHTS
): { value: number; delta: number } {
  const { prevValue, todayLog, dayCompletedToday, streakCurrent, recentDiscomfort } =
    input;

  const registered = !!todayLog && Object.keys(todayLog.symptoms).length > 0;

  // Sem nenhuma atividade hoje → estaciona (não cai).
  if (!registered && !dayCompletedToday) {
    return { value: prevValue, delta: 0 };
  }

  let gain = 0;
  if (dayCompletedToday) gain += w.completeDay;
  if (registered) gain += w.register;
  if (todayLog?.hydrationOk) gain += w.hydration;
  if (streakCurrent > 0) gain += Math.min(streakCurrent, w.streakCap) > 0 ? w.streakPerDay : 0;

  // Tendência dos sintomas: melhora soma (1..trendMax), piora subtrai (suave).
  if (registered && recentDiscomfort != null) {
    const todayDisc = dayDiscomfort(todayLog!);
    const diff = recentDiscomfort - todayDisc; // >0 = melhorou (menos desconforto)
    if (diff > 0.1) gain += Math.min(w.trendMax, Math.max(1, Math.round(diff * 2)));
    else if (diff < -0.1) gain -= Math.min(w.worsenMax, Math.max(1, Math.round(-diff * 2)));
  }

  let value = prevValue + gain;
  // Anti-despenque: nunca cai mais que maxDailyDrop num dia.
  value = Math.max(prevValue - w.maxDailyDrop, value);
  value = Math.max(0, Math.min(100, value));
  return { value, delta: value - prevValue };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Recalcula o ponto de Índice Intestinal de hoje a partir do AppData e devolve o novo
 *  array de scores (um ponto por dia). */
export function recomputedScores(
  d: AppData,
  today: string = todayKey()
): GutScorePoint[] {
  const prevPoint = [...d.scores]
    .filter((p) => p.date < today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .pop();
  const prevValue = prevPoint
    ? prevPoint.value
    : initialScore(d.user?.onboarding ?? null);

  const todayLog = d.logs.find((l) => l.date === today);
  const dayCompletedToday = Object.values(d.progress?.completedAt ?? {}).includes(
    today
  );

  const priorLogged = d.logs
    .filter((l) => l.date < today && Object.keys(l.symptoms).length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-3);
  const recentDiscomfort = priorLogged.length
    ? avg(priorLogged.map(dayDiscomfort))
    : null;

  const { value, delta } = computeDayScore({
    prevValue,
    todayLog,
    dayCompletedToday,
    streakCurrent: d.streak.current,
    recentDiscomfort,
  });

  const others = d.scores.filter((p) => p.date !== today);
  return [...others, { date: today, value, delta }].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/** Score atual + sinalização para a UI (mensagem de ajuda quando trava/cai). */
export function scoreStatus(d: AppData): {
  value: number;
  delta: number;
  needsHelp: boolean;
} {
  const last = [...d.scores].sort((a, b) => a.date.localeCompare(b.date)).pop();
  const value = last?.value ?? initialScore(d.user?.onboarding ?? null);
  const delta = last?.delta ?? 0;
  // precisa de ajuda: 3+ pontos recentes sem subir
  const recent = d.scores.slice(-3);
  const needsHelp = recent.length >= 3 && recent.every((p) => p.delta <= 0);
  return { value, delta, needsHelp };
}
