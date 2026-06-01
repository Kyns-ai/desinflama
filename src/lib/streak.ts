/** Lógica da ofensiva (streak). Conta dias ativos consecutivos (concluir dia da
 *  jornada ou registrar). É PERDOÁVEL: um escudo ("freeze") cobre UM dia perdido
 *  sem zerar a sequência — porque perder um único dia não atrapalha a formação
 *  de hábito (Lally et al., 2010) e o perdão aumenta a retenção (dados públicos
 *  do Duolingo). Guarda o recorde (longest). */
import type { Streak } from "@/types/domain";
import { MAX_SHIELDS } from "@/types/domain";
import { addDays, diffDays, todayKey } from "./date";

export interface BumpResult {
  streak: Streak;
  /** true se um escudo foi consumido para salvar a sequência neste bump. */
  shieldUsed: boolean;
}

/** Aplica atividade de `today` à ofensiva, retornando também se um escudo
 *  salvou a sequência (para celebrar/avisar a usuária). */
export function applyStreak(
  streak: Streak,
  today: string = todayKey()
): BumpResult {
  const shields = streak.shields ?? MAX_SHIELDS;

  if (streak.lastActiveDate === today) {
    return { streak: { ...streak, shields }, shieldUsed: false };
  }

  if (!streak.lastActiveDate) {
    return {
      streak: { current: 1, longest: Math.max(streak.longest, 1), lastActiveDate: today, shields },
      shieldUsed: false,
    };
  }

  const gap = diffDays(today, streak.lastActiveDate); // dias desde a última atividade

  // Ontem → sequência continua normalmente.
  if (gap === 1) {
    const current = streak.current + 1;
    return {
      streak: { current, longest: Math.max(streak.longest, current), lastActiveDate: today, shields },
      shieldUsed: false,
    };
  }

  // Pulou exatamente 1 dia e há escudo → perdoa, consome 1 escudo, continua.
  if (gap === 2 && shields > 0) {
    const current = streak.current + 1;
    return {
      streak: {
        current,
        longest: Math.max(streak.longest, current),
        lastActiveDate: today,
        shields: shields - 1,
      },
      shieldUsed: true,
    };
  }

  // Quebrou (mais de 1 dia perdido, ou sem escudo) → recomeça do 1.
  return {
    streak: { current: 1, longest: Math.max(streak.longest, 1), lastActiveDate: today, shields },
    shieldUsed: false,
  };
}

export function bumpStreak(streak: Streak, today: string = todayKey()): Streak {
  return applyStreak(streak, today).streak;
}

/** Repõe escudos até o máximo (chamado em marcos da jornada). */
export function grantShield(streak: Streak, n = 1): Streak {
  return {
    ...streak,
    shields: Math.min(MAX_SHIELDS, (streak.shields ?? MAX_SHIELDS) + n),
  };
}

/** Verdadeiro se a ofensiva está "em risco" (não houve atividade hoje, mas
 *  houve ontem) — usado para o lembrete de retenção. */
export function streakAtRisk(streak: Streak, today: string = todayKey()): boolean {
  if (streak.current === 0) return false;
  return streak.lastActiveDate === addDays(today, -1);
}

/** Consistência 0–1 num período: dias ativos / dias decorridos (mín. 1). */
export function consistency(activeDays: number, elapsedDays: number): number {
  if (elapsedDays <= 0) return 0;
  return Math.max(0, Math.min(1, activeDays / elapsedDays));
}
