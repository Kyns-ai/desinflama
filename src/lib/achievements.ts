/** Conquistas/níveis — definições e reconciliação a partir do estado real. */
import type { AppData, Achievement } from "@/types/domain";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  check: (d: AppData) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Conquistas do Dia 0 — destravam na primeira sessão (a tela de conquistas
  // não pode ser um muro de cadeados na janela de reembolso).
  {
    id: "primeiro-passo",
    title: "Primeiro passo",
    description: "Assumiu seu compromisso de check-ins",
    emoji: "🤝",
    check: (d) => !!d.commitmentAt,
  },
  {
    id: "primeiro-alivio",
    title: "Primeiro alívio",
    description: "Sentiu a primeira Calmaria no corpo",
    emoji: "🌬️",
    check: (d) => !!d.flags.primeiroAlivio,
  },
  {
    id: "primeiro-registro",
    title: "Primeiro registro",
    description: "Você fez seu primeiro check-in",
    emoji: "🌱",
    check: (d) => d.logs.length >= 1,
  },
  {
    id: "dia-1",
    title: "Dia 1 vencido",
    description: "Concluiu o primeiro dia do desafio",
    emoji: "✅",
    check: (d) => (d.progress?.completedDays.length ?? 0) >= 1,
  },
  {
    id: "streak-3",
    title: "Pegando o ritmo",
    description: "3 dias seguidos de cuidado",
    emoji: "🔥",
    check: (d) => d.streak.longest >= 3,
  },
  {
    id: "semana-1",
    title: "Uma semana inteira",
    description: "Chegou ao marco de 7 dias",
    emoji: "🏆",
    check: (d) => (d.progress?.completedDays.filter((x) => x <= 7).length ?? 0) >= 7,
  },
  {
    id: "score-70",
    title: "Intestino feliz",
    description: "Seu Índice Intestinal chegou a 70",
    emoji: "💚",
    check: (d) => d.scores.some((s) => s.value >= 70),
  },
  {
    id: "primeiro-teste",
    title: "Primeiro teste",
    description: "Testou seu 1º grupo na reintrodução",
    emoji: "🧪",
    check: (d) => d.tolerance.length >= 1,
  },
  {
    id: "reintroducao",
    title: "Detetive do intestino",
    description: "Completou a fase de reintrodução",
    emoji: "🔬",
    check: (d) => (d.progress?.completedDays.includes(11) ?? false),
  },
  {
    id: "fotos-3",
    title: "Antes e depois",
    description: "Registrou 3 fotos de progresso",
    emoji: "📸",
    check: (d) => d.photos.length >= 3,
  },
  {
    id: "mapa-completo",
    title: "Mapa concluído",
    description: "Terminou o desafio de 14 dias",
    emoji: "🗺️",
    check: (d) => (d.progress?.completedDays.includes(14) ?? false),
  },
  {
    id: "streak-7",
    title: "Constância de ferro",
    description: "7 dias seguidos sem falhar",
    emoji: "⚡",
    check: (d) => d.streak.longest >= 7,
  },
  {
    id: "reset-completo",
    title: "Reset profundo",
    description: "Concluiu a extensão de 21 dias",
    emoji: "🌟",
    check: (d) => (d.progress?.completedDays.includes(21) ?? false),
  },
];

/** Reconciliação: devolve a lista completa marcando desbloqueadas (preserva datas
 *  já registradas) e quais são NOVAS neste cálculo. */
export function reconcileAchievements(
  d: AppData,
  today: string
): { list: Achievement[]; newlyUnlocked: AchievementDef[] } {
  const existing = new Map(d.achievements.map((a) => [a.id, a]));
  const newlyUnlocked: AchievementDef[] = [];

  const list: Achievement[] = ACHIEVEMENTS.map((def) => {
    const prev = existing.get(def.id);
    const wasUnlocked = prev?.unlocked ?? false;
    const nowUnlocked = wasUnlocked || def.check(d);
    if (!wasUnlocked && nowUnlocked) newlyUnlocked.push(def);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      unlocked: nowUnlocked,
      date: prev?.date ?? (nowUnlocked ? today : null),
    };
  });

  return { list, newlyUnlocked };
}

export function emojiFor(id: string): string {
 return ACHIEVEMENTS.find((a) => a.id === id)?.emoji??"";
}
