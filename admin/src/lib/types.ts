/** Tipos do domínio do admin (métricas, usuárias, leads, conteúdo). */

export interface SeriesPoint {
  label: string; // ex: "01/05"
  value: number;
}

export interface Kpi {
  value: number;
  /** variação vs período anterior (fração, ex 0.12 = +12%) */
  delta: number;
}

export interface Overview {
  users: Kpi;
  premium: Kpi;
  mrr: Kpi; // em R$
  conversion: Kpi; // fração premium/total
  retentionD7: number;
  retentionD30: number;
  churn: number;
  activeToday: number;
  signups: SeriesPoint[]; // últimos 14 dias
  revenue: SeriesPoint[]; // últimos 6 meses
  planSplit: { plan: string; count: number; color: string }[];
  funnel: { etapa: string; valor: number }[];
  challengeCompletion: { dia: number; pct: number }[];
}

export type PlanId = "free" | "trial" | "monthly" | "annual";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  isPremium: boolean;
  currentDay: number;
  challengeType: string;
  score: number;
  streak: number;
  lastActive: string; // ISO
  joinedAt: string; // ISO
}

export interface UserDetail extends UserRow {
  bloatType: string;
  symptoms: string[];
  goal: string;
  logsCount: number;
  photosCount: number;
  scoreSeries: SeriesPoint[];
  recentLogs: { date: string; inchaco: number; energia: number; meals: string[] }[];
}

export type LeadStatus = "novo" | "contatado" | "fechado" | "perdido";

export interface Lead {
  id: string;
  userName: string;
  userEmail: string;
  status: LeadStatus;
  context: string; // ex "Score travado há 4 dias"
  createdAt: string;
}

export interface ContentItem {
  id: string;
  tipo: "Dia da jornada" | "Aula" | "Receita" | "Gatilho" | "Troca";
  titulo: string;
  fase?: string;
  status: "publicado" | "rascunho" | "em revisão";
  atualizadoEm: string;
}

export interface ContentGroup {
  grupo: string;
  itens: ContentItem[];
}
