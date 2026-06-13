/**
 * Projeção pessoal — ancora os marcos da PROJECTION nas datas REAIS da pessoa
 * (a partir de progress.startedAt). É a versão honesta do "gráfico de previsão"
 * dos apps de sucesso (Noom mostra "X kg até [data]"): aqui não prometemos número
 * de peso — mostramos QUANDO, no calendário dela, cada marco do programa cai, e
 * onde ela está agora. Personaliza a promessa sem inventar resultado.
 */
import { PROJECTION } from "@/content/promise";
import { addDays, shortDate, todayKey } from "./date";

export interface ProjectionPoint {
  when: string;
  label: string;
  dayOffset: number;
  dateKey: string;
  /** "30/05" */
  dateLabel: string;
  /** Já passou (a data é hoje ou antes). */
  reached: boolean;
  /** É o próximo marco ainda não alcançado. */
  isNext: boolean;
}

/** Marcos da projeção nas datas reais da pessoa, com "você está aqui". */
export function projectionTimeline(
  startedAtIso: string,
  today: string = todayKey()
): ProjectionPoint[] {
  // startedAt é ISO; normaliza pra chave YYYY-MM-DD no fuso local
  const startKey = todayKey(new Date(startedAtIso));
  const pts = PROJECTION.map((p) => {
    const dateKey = addDays(startKey, p.dayOffset);
    // chaves YYYY-MM-DD comparam cronologicamente como string
    const reached = today >= dateKey;
    return {
      when: p.when,
      label: p.label,
      dayOffset: p.dayOffset,
      dateKey,
      dateLabel: shortDate(dateKey),
      reached,
      isNext: false,
    };
  });
  const nextIdx = pts.findIndex((p) => !p.reached);
  if (nextIdx >= 0) pts[nextIdx].isNext = true;
  return pts;
}
