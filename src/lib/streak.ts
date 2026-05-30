/** Lógica da ofensiva (streak). Conta dias ativos consecutivos (concluir dia da
 *  jornada ou registrar). Quebra ao pular um dia; guarda o recorde (longest). */
import type { Streak } from "@/types/domain";
import { addDays, todayKey } from "./date";

export function bumpStreak(streak: Streak, today: string = todayKey()): Streak {
  if (streak.lastActiveDate === today) return streak; // já contou hoje
  const yesterday = addDays(today, -1);
  const current =
    streak.lastActiveDate === yesterday ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
  };
}

/** Verdadeiro se a ofensiva está “em risco” (não houve atividade hoje, mas
 *  houve ontem) — usado para o lembrete de retenção. */
export function streakAtRisk(streak: Streak, today: string = todayKey()): boolean {
  if (streak.current === 0) return false;
  return streak.lastActiveDate === addDays(today, -1);
}
