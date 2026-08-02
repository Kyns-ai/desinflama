/**
 * Helpers de Índice Intestinal para a UI. O MOTOR completo (computeGutScore, com pesos
 * e regra anti-despenque) é da Fase 8; aqui ficam o baseline inicial e leituras
 * usadas pelo dashboard/progresso.
 */
import type { AppData, GutScorePoint, OnboardingData } from "@/types/domain";

/** Pontuação inicial estimada a partir do onboarding (mais sintomas → começa
 *  mais baixo, deixando espaço pra evolução visível). Faixa ~35–52. */
export function initialScore(onboarding: OnboardingData | null): number {
  const base = 52;
  const symptoms = onboarding?.symptoms?.length ?? 2;
  const penalty = Math.min(symptoms * 3, 15);
  // inchaço de trânsito lento/estresse tende a demorar um pouco mais
  const typeAdj =
    onboarding?.bloatType === "lentidao" || onboarding?.bloatType === "estresse"
      ? 2
      : 0;
  return Math.max(30, base - penalty - typeAdj);
}

export function latestScore(
  scores: GutScorePoint[]
): { value: number; delta: number } | null {
  if (!scores.length) return null;
  const last = scores[scores.length - 1];
  return { value: last.value, delta: last.delta };
}

/** Valor/delta atual para exibição: último ponto, ou baseline se ainda não há. */
export function currentScore(data: AppData): { value: number; delta: number } {
  return (
    latestScore(data.scores) ?? {
      value: initialScore(data.user?.onboarding ?? null),
      delta: 0,
    }
  );
}

/** Score estacionado/caindo por 4+ pontos → dispara o slot de upsell
 *  (Acompanhamento). Score no teto NÃO é estagnação — sem isso, a usuária
 *  mais engajada (100 cravado) veria "seu padrão pede um olhar de perto". */
export function isScoreStalled(scores: GutScorePoint[]): boolean {
  if (scores.length < 4) return false;
  const last = scores.slice(-4);
  if (last[last.length - 1].value >= 90) return false;
  return last.every((p) => p.delta <= 0);
}

/** Microcopy que varia com o estado do score (acolhedora, sempre próximo passo). */
export function scoreMicrocopy(value: number, delta: number): string {
 if (delta > 6) return"Que salto! Seu intestino está respondendo rápido";
 if (delta > 0) return"Seu intestino está respondendo. Continua assim";
 if (delta < 0) return"Sem culpa — todo dia conta. Vamos com calma hoje";
  if (value >= 75) return "Você está num ótimo lugar. Manter é o segredo agora.";
  if (value >= 50) return "Bom caminho. Cada registro deixa seu mapa mais claro.";
  return "Começo é começo. Pequenos passos já mudam tudo.";
}
