"use client";

import { useRef, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import type { Frase } from "@/content/frases";
import { compartilharCard } from "@/lib/compartilhar";
import { cn } from "@/lib/cn";

/**
 * A frase do dia — o card que ela posta.
 *
 * Esqueleto do I am (docs/referencia/iam-03.jpg): frase em serifada grande,
 * muito ar, ornamento de linha ao fundo e a marca discreta no canto. É a peça
 * que sai do app: sem o "@desinflama" legível, o compartilhamento não devolve
 * nada pra gente.
 *
 * O fundo é line art em SVG, não foto gerada: o ornamento de linha é
 * exatamente o que o I am usa, reproduz bem em qualquer resolução e não corre
 * o risco de parecer imagem de banco/IA.
 */
export function FraseDoDia({ frase }: { frase: Frase }) {
  const alvo = useRef<HTMLDivElement>(null);
  const [ocupado, setOcupado] = useState(false);

  async function compartilhar() {
    if (!alvo.current) return;
    setOcupado(true);
    await compartilharCard(alvo.current, "desinflama-frase.png", frase.texto);
    setOcupado(false);
  }

  return (
    <section>
      <div
        ref={alvo}
        className="relative aspect-square overflow-hidden rounded-3xl bg-rose-dark px-7 py-8"
      >
        <OrnamentoBotanico />

        {/* Eyebrow e assinatura ancorados nas bordas, frase centrada no meio.
            Com os três em `justify-between`, a frase era empurrada pro centro
            geométrico e sobrava um rombo em cima — o card lia como slide de
            apresentação, não como peça de marca. */}
        <div className="relative flex h-full items-center">
          <p className="absolute inset-x-0 top-0 text-label font-semibold uppercase tracking-[0.06em] text-white/55">
            Frase de hoje
          </p>

          <p className="font-display text-[1.9rem] font-semibold leading-[1.2] tracking-tight text-white">
            {frase.texto}
          </p>

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2">
            <MarcaDesinflama />
            <span className="text-sm font-medium text-white/60">
              @desinflama
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={compartilhar}
        disabled={ocupado}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line",
          "bg-surface py-3 text-sm font-semibold text-ink transition-colors",
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
    </section>
  );
}

/** Marca em SVG (broto dentro de um círculo) — some junto no print. */
function MarcaDesinflama() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-white/15">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
      </svg>
    </span>
  );
}

/** Line art de folhagem, bem discreto — ar e textura sem poluir a frase. */
function OrnamentoBotanico() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      fill="none"
      stroke="#fff"
      strokeOpacity="0.13"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <path d="M262 -10 C 262 60 262 120 262 190" />
      <path d="M262 44 C 236 40 222 24 224 4" />
      <path d="M262 44 C 288 40 302 24 300 4" />
      <path d="M262 92 C 236 88 222 72 224 52" />
      <path d="M262 92 C 288 88 302 72 300 52" />
      <path d="M262 140 C 236 136 222 120 224 100" />
      <path d="M262 140 C 288 136 302 120 300 100" />

      <circle cx="46" cy="272" r="34" />
      <circle cx="46" cy="272" r="20" strokeOpacity="0.09" />
      <path d="M-10 300 C 40 268 76 268 120 300" />
      <path d="M292 268 c 12 6 18 18 14 30" strokeOpacity="0.1" />
    </svg>
  );
}
