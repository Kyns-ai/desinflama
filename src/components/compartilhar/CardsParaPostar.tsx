"use client";

import { useRef, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cardsDisponiveis, type CardConquista } from "@/lib/cardsConquista";
import { compartilharCard } from "@/lib/compartilhar";
import { cn } from "@/lib/cn";

/**
 * Cards de conquista prontos para o Stories.
 *
 * Mesma linguagem visual da frase do dia (fundo rosa profundo, serifada
 * grande, ornamento de linha, marca no canto) de propósito: quem vir dois
 * posts diferentes da mesma pessoa tem que reconhecer a marca sem ler o @.
 */
export function CardsParaPostar() {
  const data = useAppStore((s) => s.data);
  const cards = cardsDisponiveis(data);

  if (!cards.length) return null;

  return (
    <section>
      <h2 className="eyebrow mb-1">Para postar</h2>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft">
        Estes são seus — cada um só apareceu porque você fez o trabalho.
      </p>
      <ul className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {cards.map((c) => (
          <li key={c.id} className="w-[248px] shrink-0">
            <CartaoCompartilhavel card={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CartaoCompartilhavel({ card }: { card: CardConquista }) {
  const alvo = useRef<HTMLDivElement>(null);
  const [ocupado, setOcupado] = useState(false);

  async function compartilhar() {
    if (!alvo.current) return;
    setOcupado(true);
    await compartilharCard(
      alvo.current,
      `desinflama-${card.id}.png`,
      `${card.titulo} — Desinflama`
    );
    setOcupado(false);
  }

  return (
    <div>
      <div
        ref={alvo}
        className="relative aspect-square overflow-hidden rounded-3xl bg-rose-dark px-6 py-6"
      >
        <Ornamento />
        <div className="relative flex h-full flex-col justify-between">
          {card.numero ? (
            <p className="numeral font-display text-[4rem] leading-none text-white">
              {card.numero}
            </p>
          ) : (
            <span />
          )}

          <div>
            <p className="font-display text-[1.35rem] font-semibold leading-tight text-white">
              {card.titulo}
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-white/60">
              {card.detalhe}
            </p>
          </div>

          <p className="text-[13px] font-medium text-white/55">@desinflama</p>
        </div>
      </div>

      <button
        onClick={compartilhar}
        disabled={ocupado}
        className={cn(
          "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line",
          "bg-surface py-2.5 text-sm font-semibold text-ink transition-colors",
          "active:bg-cream-deep disabled:opacity-60"
        )}
      >
        {ocupado ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Share2 className="size-4" />
        )}
        Compartilhar
      </button>
    </div>
  );
}

function Ornamento() {
  return (
    <svg
      viewBox="0 0 260 260"
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      fill="none"
      stroke="#fff"
      strokeOpacity="0.12"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <circle cx="214" cy="58" r="40" />
      <circle cx="214" cy="58" r="24" strokeOpacity="0.08" />
      <path d="M-10 236 C 44 206 96 206 150 236" />
      <path d="M214 -6 v 128" strokeOpacity="0.08" />
    </svg>
  );
}
