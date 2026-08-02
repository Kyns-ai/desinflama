/**
 * Jardim — gamificação de sementes (estilo "Noomcoin", on-brand desinflama/planta).
 * Concluir aula/check-in/dia dá sementes; sementes enchem níveis que viram uma
 * planta e DESBLOQUEIAM recompensas reais.
 */

export interface GardenLevel {
  id: number;
  name: string;
  emoji: string;
  /** id da ilustração em public/img (ver Art). */
  art: string;
  /** Sementes necessárias para ALCANÇAR este nível. */
  threshold: number;
  /** O que sobe de nível desbloqueia (texto curto). */
  unlock?: string;
}

export const LEVELS: GardenLevel[] = [
  { id: 0, name: "Semente", emoji: "🌱", art: "garden-semente", threshold: 0 },
  { id: 1, name: "Broto", emoji: "🌿", art: "garden-broto", threshold: 10, unlock: "Receitas da nutri" },
  { id: 2, name: "Florescendo", emoji: "🌸", art: "garden-florescendo", threshold: 25, unlock: "Cardápio + lista de compras" },
  { id: 3, name: "Jardim", emoji: "🪴", art: "garden-jardim", threshold: 50, unlock: "Comer fora sem inchar" },
];

/**
 * Sementes ganhas por ação (Seção 5 do PLANO).
 *
 * Os valores antigos (1, 1, 2, 3) vinham de uma época sem loja: serviam só
 * para subir de nível. Com os Prazeres, o número precisa ter PREÇO — a média
 * de quem faz tudo é ~60–70/dia, então uma taça de vinho (80) sai em pouco
 * mais de um dia bem feito e a pizza (200) exige três.
 */
export const SEEDS = {
  checkin: 10,
  lesson: 10,
  agua: 5,
  tarefa: 5,
  foto: 5,
  semGatilho: 15,
  calmaria: 5,
  completeDay: 20,
  /** Fechar a semana inteira (dias 7/14/21). */
  milestone: 50,
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

/** Recompensas desbloqueadas por nível. Cada uma leva a conteúdo REAL
 *  (sem rótulo morto): quando liberada, o card vira link pro `href`. */
export interface Reward {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  levelNeeded: number;
  href: string;
}

export const REWARDS: Reward[] = [
  { id: "recipes", title: "Receitas da nutri", desc: "Biblioteca de receitas low FODMAP", emoji: "🍲", levelNeeded: 1, href: "/aprender" },
  { id: "cardapio", title: "Cardápio + lista de compras", desc: "Seu menu da semana, pronto pra seguir", emoji: "🛒", levelNeeded: 2, href: "/cardapio" },
  { id: "comerfora", title: "Comer fora sem inchar", desc: "Restaurante, churrasco, pizza e bar", emoji: "🍽️", levelNeeded: 3, href: "/bonus" },
];

export function rewardUnlocked(reward: Reward, seeds: number): boolean {
  return gardenFor(seeds).level.id >= reward.levelNeeded;
}
