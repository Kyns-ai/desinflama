/**
 * Gera o insight/elogio imediato ao salvar um registro. NUNCA salvar sem
 * devolver algo positivo e útil (ver Seção 7). Usa os dados reais para soar
 * pessoal: tendência de sintomas, sequência de registros, melhora.
 */
import type { DailyLog, SymptomKey } from "@/types/domain";
import { addDays } from "./date";

/** Sintomas em que MENOR é melhor (inchaço/gases/intestino) vs MAIOR (energia/pele). */
const LOWER_IS_BETTER: SymptomKey[] = ["inchaco", "gases", "intestino"];

export function logInsight(logs: DailyLog[], current: DailyLog): string {
  // registros em dias consecutivos
  const streak = consecutiveLogDays(logs, current.date);
  if (streak >= 3) {
 return`${streak} dias registrando seguido! É assim que seu mapa fica preciso`;
  }

  // comparação com o dia anterior
  const prev = logs.find((l) => l.date === addDays(current.date, -1));
  if (prev) {
    const improved = improvedSymptom(prev, current);
    if (improved) return improved;
  }

  // primeira vez / fallback acolhedor
  if (logs.length <= 1) {
 return"Primeiro registro feito! Cada um deixa seu Índice Intestinal mais real";
  }

  const positives = [
"Registrado! Seu padrão está ficando mais claro",
"Anotado. Pequenos registros, grandes descobertas.",
"Feito! Seu intestino agradece a atenção",
"Mais um dia mapeado. Você está no controle agora",
  ];
  // varia pelo dia, sem aleatoriedade
  const idx = current.date.split("-").reduce((a, b) => a + Number(b), 0);
  return positives[idx % positives.length];
}

function improvedSymptom(prev: DailyLog, cur: DailyLog): string | null {
  const labels: Record<SymptomKey, string> = {
    inchaco: "inchaço",
    gases: "gases",
    intestino: "intestino",
    energia: "energia",
    pele: "pele",
  };
  for (const key of LOWER_IS_BETTER) {
    const a = prev.symptoms[key];
    const b = cur.symptoms[key];
    if (a != null && b != null && b < a) {
 return`Seu ${labels[key]} melhorou desde ontem Continua assim!`;
    }
  }
  for (const key of ["energia", "pele"] as SymptomKey[]) {
    const a = prev.symptoms[key];
    const b = cur.symptoms[key];
    if (a != null && b != null && b > a) {
 return`Sua ${labels[key]} subiu desde ontem O intestino agradece!`;
    }
  }
  return null;
}

function consecutiveLogDays(logs: DailyLog[], today: string): number {
  const dates = new Set(logs.map((l) => l.date));
  let count = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}
