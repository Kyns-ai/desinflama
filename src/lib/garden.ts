/**
 * Jardim — gamificação de sementes (estilo "Noomcoin", on-brand desinflama/planta).
 * Concluir aula/check-in/dia dá sementes; sementes enchem níveis que viram uma
 * planta e DESBLOQUEIAM recompensas reais.
 */

export interface GardenLevel {
  id: number;
  name: string;
  emoji: string;
  /** Sementes necessárias para ALCANÇAR este nível. */
  threshold: number;
  /** O que sobe de nível desbloqueia (texto curto). */
  unlock?: string;
}

export const LEVELS: GardenLevel[] = [
  { id: 0, name: "Semente", emoji: "🌱", threshold: 0 },
  { id: 1, name: "Broto", emoji: "🌿", threshold: 10, unlock: "3 receitas bônus" },
  { id: 2, name: "Florescendo", emoji: "🌸", threshold: 25, unlock: "Dia de Troca 🍫" },
  { id: 3, name: "Jardim", emoji: "🪴", threshold: 50, unlock: "Desafio bônus" },
];

/** Sementes ganhas por ação (centralizado). */
export const SEEDS = {
  lesson: 1,
  checkin: 1,
  completeDay: 2,
  milestone: 3,
} as const;

export interface GardenState {
  level: GardenLevel;
  nextLevel: GardenLevel | null;
  /** progresso 0–1 até o próximo nível. */
  progress: number;
  /** sementes que faltam para o próximo nível. */
  toNext: number;
  seeds: number;
}

export function gardenFor(seeds: number): GardenState {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (seeds >= LEVELS[i].threshold) {
      idx = i;
      break;
    }
  }
  const level = LEVELS[idx];
  const nextLevel = LEVELS[idx + 1] ?? null;
  if (!nextLevel) {
    return { level, nextLevel: null, progress: 1, toNext: 0, seeds };
  }
  const span = nextLevel.threshold - level.threshold;
  const into = seeds - level.threshold;
  return {
    level,
    nextLevel,
    progress: Math.max(0, Math.min(1, into / span)),
    toNext: Math.max(0, nextLevel.threshold - seeds),
    seeds,
  };
}

/** Detecta subida de nível ao ir de `before` para `after` sementes. */
export function leveledUp(before: number, after: number): GardenLevel | null {
  const a = gardenFor(before).level.id;
  const b = gardenFor(after).level.id;
  return b > a ? gardenFor(after).level : null;
}

/** Recompensas desbloqueadas por nível (para a tela de jardim/progresso). */
export interface Reward {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  levelNeeded: number;
}

export const REWARDS: Reward[] = [
  { id: "recipes", title: "3 receitas bônus", desc: "Receitas extras da nutri", emoji: "🍲", levelNeeded: 1 },
  { id: "treat", title: "Dia de Troca", desc: "Um dia livre planejado, sem culpa", emoji: "🍫", levelNeeded: 2 },
  { id: "challenge", title: "Desafio bônus", desc: "Um mini-desafio extra de 3 dias", emoji: "🎯", levelNeeded: 3 },
];

export function rewardUnlocked(reward: Reward, seeds: number): boolean {
  return gardenFor(seeds).level.id >= reward.levelNeeded;
}
