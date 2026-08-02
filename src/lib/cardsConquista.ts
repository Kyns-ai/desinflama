/**
 * Os cards que ela realmente quer postar (Seção 7 do PLANO).
 *
 * A diferença entre isto e a frase do dia: a frase é bonita, o card de
 * conquista é *dela*. "Descobri meu gatilho: lactose" só existe porque ela fez
 * o teste — ninguém posta isso sem ter feito o trabalho, e é justamente por
 * isso que esse post converte.
 *
 * Regra: card só aparece quando o fato JÁ ACONTECEU. Card de conquista
 * bloqueado seria propaganda dentro do app dela.
 */

import type { AppData } from "@/types/domain";
import { REINTRO_GROUPS } from "@/content/tolerance";
import { faixaDe } from "@/lib/notaPrato";
import { todayKey } from "@/lib/date";

export interface CardConquista {
  id: string;
  /** A linha grande do card. */
  titulo: string;
  /** A linha pequena, embaixo. */
  detalhe: string;
  /** Número gigante, quando o marco é numérico. */
  numero?: string;
}

export function cardsDisponiveis(d: AppData): CardConquista[] {
  const cards: CardConquista[] = [];

  /* ---- 1. dias seguidos de cuidado ---- */
  if (d.streak.current >= 7) {
    cards.push({
      id: "ofensiva",
      numero: String(d.streak.current),
      titulo: `${d.streak.current} dias cuidando de mim`,
      detalhe: "seguidos, sem pular",
    });
  }

  /* ---- 2. gatilho descoberto ---- */
  // O card mais forte do conjunto: é o único que entrega uma DESCOBERTA, não
  // um contador. Sai do teste mais recente com reação forte ou moderada.
  const reagiu = [...d.tolerance]
    .filter((t) => t.reaction >= 2)
    .sort((a, b) => b.dateTested.localeCompare(a.dateTested))[0];
  if (reagiu) {
    const nome =
      REINTRO_GROUPS.find((g) => g.group === reagiu.group)?.nome ?? reagiu.group;
    cards.push({
      id: "gatilho",
      titulo: `Descobri meu gatilho: ${nome.toLowerCase()}`,
      detalhe: "testei no meu corpo, não li numa lista",
    });
  }

  /* ---- 3. nota do prato de hoje ---- */
  const hoje = todayKey();
  const doDia = d.refeicoes.filter((r) => r.date === hoje);
  if (doDia.length) {
    const media = Math.round(
      doDia.reduce((s, r) => s + r.nota, 0) / doDia.length
    );
    // Só vira card quando é bom: postar "minha nota hoje: 34" não é conquista,
    // é exposição — e ela não voltaria a abrir a tela depois disso.
    if (faixaDe(media) === "cai-bem") {
      cards.push({
        id: "nota",
        numero: String(media),
        titulo: "Meu prato hoje",
        detalhe: "nota Desinflama — calculada pro MEU corpo",
      });
    }
  }

  /* ---- 4. dia da jornada concluído ---- */
  const ultimoDia = Math.max(0, ...(d.progress?.completedDays ?? [0]));
  if (ultimoDia >= 7) {
    cards.push({
      id: "dia",
      numero: String(ultimoDia),
      titulo: `Dia ${ultimoDia} concluído`,
      detalhe: "um dia de cada vez, e deu certo",
    });
  }

  return cards;
}
