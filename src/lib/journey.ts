/**
 * Estrutura da jornada (fases por dia). O CONTEÚDO de cada dia (lição, checklist,
 * refeições) é definido na Fase 11; aqui ficam apenas o esqueleto e as regras de
 * progressão, usados desde o onboarding ("Começar meu Dia 1").
 */
import type { ChallengeType, JourneyPhase, JourneyProgress } from "@/types/domain";
import { todayKey } from "./date";

export interface PhaseRange {
  phase: JourneyPhase;
  start: number;
  end: number;
  focus: string;
  tone: "coral" | "sage" | "sky" | "plum" | "gold";
}

/** Desafio principal de 14 dias (framework 5R). */
export const MAIN14_PHASES: PhaseRange[] = [
  { phase: "Choque", start: 1, end: 3, focus: "Desinchar rápido", tone: "coral" },
  { phase: "Remove", start: 4, end: 7, focus: "Mapear seu gatilho", tone: "sage" },
  { phase: "Reintrodução", start: 8, end: 11, focus: "Testar tolerância", tone: "sky" },
  { phase: "Repair", start: 12, end: 14, focus: "Reparar e fechar", tone: "plum" },
];

/** Extensão Reset Profundo (dias 15–21). */
export const RESET21_PHASES: PhaseRange[] = [
  ...MAIN14_PHASES,
  { phase: "Rebalance", start: 15, end: 21, focus: "Sono, estresse, movimento", tone: "gold" },
];

export function totalDays(challenge: ChallengeType): number {
  if (challenge === "main14") return 14;
  if (challenge === "reset21") return 21;
  if (challenge === "maintenance") return Infinity;
  return 7; // desafios mensais
}

export function phasesFor(challenge: ChallengeType): PhaseRange[] {
  if (challenge === "reset21") return RESET21_PHASES;
  return MAIN14_PHASES;
}

export function phaseForDay(
  day: number,
  challenge: ChallengeType = "main14"
): PhaseRange {
  const ranges = phasesFor(challenge);
  return (
    ranges.find((r) => day >= r.start && day <= r.end) ??
    ranges[ranges.length - 1]
  );
}

/** Cria o progresso inicial ao começar o desafio principal. */
export function newJourney(challenge: ChallengeType = "main14"): JourneyProgress {
  return {
    currentDay: 1,
    phase: phaseForDay(1, challenge).phase,
    completedDays: [],
    challengeType: challenge,
    completedAt: {},
    startedAt: new Date().toISOString(),
  };
}

export { todayKey };
