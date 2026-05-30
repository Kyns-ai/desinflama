import type {
  ContentGroup,
  Lead,
  Overview,
  UserDetail,
  UserRow,
} from "@/lib/types";

// Gerador determinístico simples (sem Math.random) para dados de demonstração.
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const NOMES = [
  "Marina Souza", "Júlia Lima", "Ana Carvalho", "Beatriz Rocha", "Camila Dias",
  "Fernanda Alves", "Patrícia Gomes", "Larissa Melo", "Renata Pinto", "Carla Nunes",
  "Bruna Castro", "Sofia Ramos", "Helena Costa", "Manuela Reis", "Isabela Freitas",
  "Letícia Barros", "Gabriela Pires", "Mariana Teixeira", "Vanessa Cardoso", "Aline Moreira",
  "Tatiane Ribeiro", "Priscila Azevedo", "Débora Fonseca", "Natália Campos", "Bianca Lopes",
  "Yasmin Cunha", "Eduarda Martins", "Rafaela Moura", "Clara Antunes", "Lívia Farias",
];

const PLANOS = ["annual", "monthly", "trial", "free"] as const;
const FASES = ["main14", "reset21", "maintenance"] as const;

function daysAgoISO(n: number): string {
  // base fixa pra determinismo (não usar Date.now em build)
  const base = new Date("2026-05-30T12:00:00Z").getTime();
  return new Date(base - n * 86400000).toISOString();
}

export function mockUsers(): UserRow[] {
  const r = rng(7);
  return NOMES.map((name, i) => {
    const email = name.toLowerCase().replace(/[^a-z ]/g, "").replace(/ /g, ".") + "@email.com";
    const planRoll = r();
    const plan =
      planRoll > 0.74 ? "annual" : planRoll > 0.55 ? "monthly" : planRoll > 0.4 ? "trial" : "free";
    const isPremium = plan === "annual" || plan === "monthly";
    return {
      id: `u_${1000 + i}`,
      name,
      email,
      plan,
      isPremium,
      currentDay: 1 + Math.floor(r() * 20),
      challengeType: FASES[Math.floor(r() * FASES.length)],
      score: 35 + Math.floor(r() * 55),
      streak: Math.floor(r() * 18),
      lastActive: daysAgoISO(Math.floor(r() * 9)),
      joinedAt: daysAgoISO(5 + Math.floor(r() * 120)),
    };
  });
}

export function mockOverview(): Overview {
  const r = rng(42);
  const signups = Array.from({ length: 14 }, (_, i) => ({
    label: `${String(30 - (13 - i)).padStart(2, "0")}/05`,
    value: 18 + Math.floor(r() * 34),
  }));
  const revenue = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"].map((m, i) => ({
    label: m,
    value: 14000 + i * 4200 + Math.floor(r() * 3000),
  }));
  return {
    users: { value: 1240, delta: 0.14 },
    premium: { value: 312, delta: 0.21 },
    mrr: { value: 38760, delta: 0.18 },
    conversion: { value: 0.251, delta: 0.03 },
    retentionD7: 0.62,
    retentionD30: 0.38,
    churn: 0.042,
    activeToday: 287,
    signups,
    revenue,
    planSplit: [
      { plan: "Anual", count: 198, color: "#3C9A71" },
      { plan: "Mensal", count: 114, color: "#6aa6c4" },
      { plan: "Trial", count: 156, color: "#D8A657" },
      { plan: "Grátis", count: 772, color: "#ECE6DB" },
    ],
    funnel: [
      { etapa: "Cadastro", valor: 1240 },
      { etapa: "Onboarding", valor: 1086 },
      { etapa: "Dia 1 concluído", valor: 812 },
      { etapa: "Dia 3 (fim grátis)", valor: 503 },
      { etapa: "Assinou", valor: 312 },
    ],
    challengeCompletion: [1, 3, 5, 7, 9, 11, 14].map((dia) => ({
      dia,
      pct: Math.max(0.18, 0.95 - dia * 0.055),
    })),
  };
}

export function mockUserDetail(id: string): UserDetail {
  const base = mockUsers().find((u) => u.id === id) ?? mockUsers()[0];
  const r = rng(id.length * 13 + 5);
  const scoreSeries = Array.from({ length: 10 }, (_, i) => ({
    label: `D${i + 1}`,
    value: 40 + i * 3 + Math.floor(r() * 6),
  }));
  return {
    ...base,
    bloatType: ["Fermentação", "Retenção", "Trânsito lento", "Estresse"][Math.floor(r() * 4)],
    symptoms: ["Inchaço", "Gases", "Energia"],
    goal: "Desinchar a barriga",
    logsCount: 6 + Math.floor(r() * 30),
    photosCount: Math.floor(r() * 5),
    scoreSeries,
    recentLogs: Array.from({ length: 5 }, (_, i) => ({
      date: daysAgoISO(i),
      inchaco: 1 + Math.floor(r() * 5),
      energia: 1 + Math.floor(r() * 5),
      meals: ["Ovos + tapioca", "Frango + arroz", "Sopa de abóbora"].slice(0, 1 + Math.floor(r() * 3)),
    })),
  };
}

export function mockLeads(): Lead[] {
  const users = mockUsers();
  const ctx = [
    "Índice Intestinal travado há 4 dias",
    "Sintomas irregulares na reintrodução",
    "Score caindo + inchaço persistente",
    "Concluiu 14 dias, quer plano individual",
    "Pediu ajuda no registro 3x",
  ];
  const status = ["novo", "contatado", "novo", "fechado", "novo", "contatado", "perdido"] as const;
  return users.slice(0, 7).map((u, i) => ({
    id: `lead_${i}`,
    userName: u.name,
    userEmail: u.email,
    status: status[i],
    context: ctx[i % ctx.length],
    createdAt: daysAgoISO(i),
  }));
}

export function mockContent(): ContentGroup[] {
  const mk = (
    tipo: ContentGroup["itens"][number]["tipo"],
    titulo: string,
    fase: string | undefined,
    status: ContentGroup["itens"][number]["status"],
    d: number
  ) => ({ id: titulo, tipo, titulo, fase, status, atualizadoEm: daysAgoISO(d) });
  return [
    {
      grupo: "Jornada — 14 dias",
      itens: [
        mk("Dia da jornada", "Dia 1 · Por que você vive estufada", "Choque", "publicado", 12),
        mk("Dia da jornada", "Dia 4 · Detetive do intestino", "Remove", "publicado", 12),
        mk("Dia da jornada", "Dia 8 · Reintrodução", "Reintrodução", "publicado", 12),
        mk("Dia da jornada", "Dia 14 · Seu mapa pessoal", "Repair", "em revisão", 2),
      ],
    },
    {
      grupo: "Biblioteca",
      itens: [
        mk("Aula", "FODMAP explicado", "Fundamentos", "publicado", 20),
        mk("Aula", "Eixo intestino-pele", "Ciência", "publicado", 18),
        mk("Receita", "Sopa de abóbora com gengibre", "Choque", "publicado", 15),
        mk("Gatilho", "Cebola e alho (frutanos)", undefined, "publicado", 30),
        mk("Troca", "Leite → leite sem lactose", undefined, "rascunho", 1),
      ],
    },
  ];
}
