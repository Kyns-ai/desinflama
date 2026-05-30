/**
 * Conta de demonstração — estado realista e coerente para mostrar o app sem
 * precisar preencher nada. Premium liberado, Dia 6, histórico de ~6 dias com
 * sintomas melhorando, gatilho de laticínio aparecendo no Progresso.
 *
 * As datas são relativas a HOJE, então a demo está sempre "atual".
 */
import type { AppData } from "@/types/domain";
import { emptyAppData } from "@/types/domain";
import { todayKey, addDays } from "./date";
import { reconcileAchievements } from "./achievements";

export function buildDemoData(user: { id: string; name: string; email: string }): AppData {
  const base = emptyAppData();
  const today = todayKey();
  const day = (n: number) => addDays(today, -n); // n dias atrás

  // 6 dias de registros (5 atrás → ontem); hoje ainda sem registro
  const dates = [5, 4, 3, 2, 1].map(day);
  const logs = dates.map((date, i) => {
    const ruim = i === 1; // um dia pior, com laticínio (gera o insight de gatilho)
    return {
      id: `${date}-demo`,
      date,
      meals: ruim
        ? [
            { refeicao: "cafe" as const, descricao: "Iogurte com granola e leite" },
            { refeicao: "almoco" as const, descricao: "Frango com arroz" },
          ]
        : [
            { refeicao: "cafe" as const, descricao: "Ovos + tapioca + mamão" },
            { refeicao: "almoco" as const, descricao: "Peixe + batata + salada" },
          ],
      symptoms: ruim
        ? { inchaco: 4, gases: 4, intestino: 3, energia: 2, pele: 2 }
        : {
            inchaco: Math.max(1, 4 - i),
            gases: 2,
            intestino: 4,
            energia: Math.min(5, 2 + i),
            pele: 3 + (i > 2 ? 1 : 0),
          },
      mood: (ruim ? 1 : 3) as 1 | 3,
      createdAt: new Date().toISOString(),
    };
  });

  const scores = dates.map((date, i) => ({ date, value: 42 + i * 6, delta: i === 0 ? 0 : 6 }));

  const completedAt: Record<number, string> = {};
  [1, 2, 3, 4, 5].forEach((d, i) => (completedAt[d] = dates[i]));

  const data: AppData = {
    ...base,
    user: {
      id: user.id,
      name: "Marina",
      email: user.email,
      onboarding: {
        bloatType: "fermentacao",
        symptoms: ["inchaco", "gases", "energia"],
        goal: "desinchar",
        worstTime: "noite",
      },
      createdAt: addDays(today, -20) + "T10:00:00.000Z",
    },
    subscription: {
      isPremium: true,
      plan: "annual",
      source: "web",
      renewsAt: addDays(today, 340) + "T10:00:00.000Z",
      managementUrl: null,
    },
    progress: {
      currentDay: 6,
      phase: "Remove",
      challengeType: "main14",
      completedDays: [1, 2, 3, 4, 5],
      completedAt,
      startedAt: dates[0] + "T08:00:00.000Z",
    },
    logs,
    scores,
    streak: { current: 5, longest: 5, lastActiveDate: day(1) }, // ativa até ontem
    flags: { notifications: false },
  };

  const { list } = reconcileAchievements(data, today);
  data.achievements = list;
  return data;
}
