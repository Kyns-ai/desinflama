/**
 * Ciclo menstrual × inchaço. Diferencial feminino: inchaço varia com o ciclo e
 * normalizar isso faz a usuária se sentir entendida (e evita interpretar
 * oscilação hormonal como "recaída"). Mais de metade das mulheres incham em
 * todas as fases — é comum e não é fracasso. Estimativa simples (ciclo padrão
 * de 28 dias); não é método contraceptivo nem diagnóstico.
 */
import { addDays, diffDays, todayKey } from "./date";

export type CyclePhase = "menstrual" | "folicular" | "ovulacao" | "lutea";

export interface CycleInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  label: string;
  /** Mensagem normalizante sobre inchaço naquela fase. */
  note: string;
}

const PHASE: Record<CyclePhase, { label: string; note: string }> = {
  menstrual: {
    label: "Menstrual",
    note: "Inchaço e cólica no começo da menstruação são super comuns. Vá com calma e capriche na Calmaria.",
  },
  folicular: {
    label: "Folicular",
    note: "Costuma ser a fase de mais energia e menos inchaço. Bom momento pra firmar a rotina.",
  },
  ovulacao: {
    label: "Ovulação",
    note: "Algumas pessoas incham um pouco perto da ovulação. Se acontecer, é hormonal — não é recaída.",
  },
  lutea: {
    label: "Lútea (TPM)",
    note: "Antes da menstruação, retenção e inchaço aumentam pra muita gente. É hormonal e passa. Seja gentil com você.",
  },
};

/** Estima a fase a partir da data de início do último ciclo. */
export function cycleInfo(
  cycleStart: string,
  today: string = todayKey(),
  cycleLength = 28
): CycleInfo {
  const elapsed = diffDays(today, cycleStart);
  // dia do ciclo (1-based), tolerante a datas futuras/erradas
  const dayOfCycle = ((elapsed % cycleLength) + cycleLength) % cycleLength + 1;

  let phase: CyclePhase;
  if (dayOfCycle <= 5) phase = "menstrual";
  else if (dayOfCycle <= 12) phase = "folicular";
  else if (dayOfCycle <= 16) phase = "ovulacao";
  else phase = "lutea";

  return { phase, dayOfCycle, label: PHASE[phase].label, note: PHASE[phase].note };
}

export interface BloatWindow {
  /** YYYY-MM-DD do início da janela (fase lútea tardia / TPM). */
  start: string;
  /** YYYY-MM-DD do fim da janela. */
  end: string;
  /** True se hoje já está dentro da janela. */
  active: boolean;
}

/**
 * Próxima janela de inchaço hormonal: a fase lútea tardia (dias 22–28 do
 * ciclo), quando retenção e inchaço aumentam pra maioria. Saber a data
 * transforma "recaída" em "fase prevista" — o wow da 1ª sessão.
 */
export function nextBloatWindow(
  cycleStart: string,
  today: string = todayKey(),
  cycleLength = 28
): BloatWindow {
  const elapsed = diffDays(today, cycleStart);
  const cyclesPassed = Math.floor(elapsed / cycleLength);
  // janela do ciclo atual: dias 22–28 → offsets 21–27 a partir do início
  let start = addDays(cycleStart, cyclesPassed * cycleLength + 21);
  let end = addDays(cycleStart, cyclesPassed * cycleLength + 27);
  if (diffDays(today, end) > 0) {
    // janela deste ciclo já passou — projeta a do próximo
    start = addDays(start, cycleLength);
    end = addDays(end, cycleLength);
  }
  const active = diffDays(today, start) >= 0 && diffDays(today, end) <= 0;
  return { start, end, active };
}

/** Âncoras "se-então" sugeridas (implementation intentions). */
export const RITUAL_ANCHORS = [
  "Depois do café da manhã",
  "Assim que eu acordar",
  "Depois do almoço",
  "Antes de dormir",
] as const;
