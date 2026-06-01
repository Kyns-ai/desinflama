/**
 * Ciclo menstrual × inchaço. Diferencial feminino: inchaço varia com o ciclo e
 * normalizar isso faz a usuária se sentir entendida (e evita interpretar
 * oscilação hormonal como "recaída"). Mais de metade das mulheres incham em
 * todas as fases — é comum e não é fracasso. Estimativa simples (ciclo padrão
 * de 28 dias); não é método contraceptivo nem diagnóstico.
 */
import { diffDays, todayKey } from "./date";

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

/** Âncoras "se-então" sugeridas (implementation intentions). */
export const RITUAL_ANCHORS = [
  "Depois do café da manhã",
  "Assim que eu acordar",
  "Depois do almoço",
  "Antes de dormir",
] as const;
