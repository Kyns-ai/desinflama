/* ------------------------------------------------------------------ *
 *  Desinflama — Modelo de domínio (ver Seção 6 do plano).
 *  Tipos compartilhados entre serviços, repositório, store e UI.
 * ------------------------------------------------------------------ */

/** Sintomas rastreados (escala 1–5). Para energia/pele, maior é melhor;
 *  para inchaço/gases/intestino, menor é melhor. */
export type SymptomKey =
  | "inchaco"
  | "gases"
  | "intestino"
  | "energia"
  | "pele";

export type SymptomScores = Partial<Record<SymptomKey, number>>;

/** Tipo de inchaço identificado no Mapa de Inchaço. */
export type BloatType =
  | "fermentacao" // gás por fermentação de FODMAPs
  | "retencao" // retenção de líquido (sódio/hormonal)
  | "lentidao" // trânsito lento / constipação
  | "estresse"; // eixo intestino-cérebro

/** Objetivo principal escolhido no onboarding. */
export type Goal =
  | "desinchar"
  | "energia"
  | "pele"
  | "digestao"
  | "rotina";

export interface OnboardingData {
  bloatType: BloatType;
  symptoms: SymptomKey[];
  goal: Goal;
  /** Quando costuma inchar mais (manhã/tarde/noite/após refeições). */
  worstTime?: "manha" | "tarde" | "noite" | "refeicoes";
}

export interface User {
  id: string;
  name: string;
  email: string;
  onboarding: OnboardingData | null;
  createdAt: string; // ISO
}

/* ------------------------------ Assinatura ------------------------------ */

export type PlanId = "free" | "trial" | "monthly" | "annual";
export type PurchaseSource = "web" | "ios" | "android" | "none";

export interface Subscription {
  isPremium: boolean;
  plan: PlanId;
  source: PurchaseSource;
  renewsAt: string | null; // ISO
  /** Identificador do cliente no RevenueCat (= id do usuário). */
  managementUrl?: string | null;
}

/* ------------------------------ Jornada ------------------------------ */

export type JourneyPhase =
  | "Choque"
  | "Remoção"
  | "Reintrodução"
  | "Reparo"
  | "Reequilíbrio"
  | "Manutenção";

/** main14 = desafio principal; reset21 = extensão; monthly:<id> = desafio
 *  mensal; maintenance = modo manutenção contínuo. */
export type ChallengeType =
  | "main14"
  | "reset21"
  | `monthly:${string}`
  | "maintenance";

export interface JourneyProgress {
  currentDay: number;
  phase: JourneyPhase;
  completedDays: number[];
  challengeType: ChallengeType;
  /** Programa fechado antes de entrar na Manutenção (permite voltar ao Reset). */
  completedChallenge?: "main14" | "reset21";
  /** Data (YYYY-MM-DD) em que cada dia foi concluído. */
  completedAt: Record<number, string>;
  startedAt: string; // ISO
}

/* ------------------------------ Registros ------------------------------ */

export type Mood = 1 | 2 | 3; // 😣 😐 😌

export interface MealEntry {
  refeicao: "cafe" | "almoco" | "jantar" | "lanche";
  descricao: string;
  /** Referência local da foto (opcional). */
  photoRef?: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  symptoms: SymptomScores;
  mood: Mood | null;
  notes?: string;
  hydrationOk?: boolean;
  createdAt: string; // ISO
}

/* ------------------------------ Score / Streak ------------------------------ */

export interface GutScorePoint {
  date: string; // YYYY-MM-DD
  value: number; // 0–100
  delta: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  /** Escudos que perdoam UM dia perdido sem zerar a sequência (estilo "streak
   *  freeze"). Evidência: perder 1 dia não quebra a formação de hábito
   *  (Lally 2010) e o perdão aumenta retenção (dados do Duolingo). */
  shields: number;
}

/* ------------------------------ Fotos / Conquistas ------------------------------ */

export interface Photo {
  id: string;
  date: string; // YYYY-MM-DD
  ref: string; // base64/dataURL ou caminho no Filesystem (privado, local)
  private: true;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  date: string | null; // ISO quando desbloqueada
}

/** Correlação alimento × piora de sintoma, derivada dos logs. */
export interface TriggerInsight {
  food: string;
  correlationStrength: number; // 0–1
  occurrences: number;
}

/* ------------------------------ Estado persistido ------------------------------ */

/** Tudo que o app guarda localmente e sincroniza (quando houver backend). */
export interface AppData {
  user: User | null;
  subscription: Subscription;
  progress: JourneyProgress | null;
  logs: DailyLog[];
  scores: GutScorePoint[];
  streak: Streak;
  photos: Photo[];
  achievements: Achievement[];
  /** Itens do checklist marcados por dia da jornada (dia → índices). */
  checklists: Record<number, number[]>;
  /** Sementes acumuladas (gamificação — viram nível/jardim e desbloqueios). */
  seeds: number;
  /** Aulas concluídas por dia (dia → true). */
  lessonsDone: Record<number, boolean>;
  /** Plano "se-então" (implementation intention): âncora escolhida pela usuária,
   *  ex. "Depois do café da manhã". Vira o gatilho do ritual e a cópia do
   *  lembrete. Maior efeito por feature na adesão (Gollwitzer & Sheeran 2006). */
  ritualAnchor?: string;
  /** Data de início do último ciclo menstrual (YYYY-MM-DD), opcional. */
  cycleStart?: string;
  /** chaves de notificações/flags simples. */
  flags: Record<string, boolean>;
}

export const FREE_SUBSCRIPTION: Subscription = {
  isPremium: false,
  plan: "free",
  source: "none",
  renewsAt: null,
  managementUrl: null,
};

/** Escudos máximos acumuláveis (Duolingo usa até 2 equipados). */
export const MAX_SHIELDS = 2;

export const EMPTY_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  shields: MAX_SHIELDS, // começa abastecida — perdão desde o dia 1
};

/** Estado inicial limpo (usuário novo, sem dados). */
export function emptyAppData(): AppData {
  return {
    user: null,
    subscription: { ...FREE_SUBSCRIPTION },
    progress: null,
    logs: [],
    scores: [],
    streak: { ...EMPTY_STREAK },
    photos: [],
    achievements: [],
    checklists: {},
    seeds: 0,
    lessonsDone: {},
    flags: {},
  };
}
