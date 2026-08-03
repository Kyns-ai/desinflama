"use client";

import { Anchor, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { RITUAL_ANCHORS } from "@/lib/cycle";
import { haptic } from "@/lib/haptics";

/**
 * O ritual "se-então" — a âncora do hábito.
 *
 * "Depois do café da manhã, eu cuido do meu intestino." É a implementation
 * intention de Gollwitzer & Sheeran (2006), e é a feature de maior efeito por
 * linha de código em adesão que existe neste app: quem amarra o hábito novo a
 * um momento que JÁ EXISTE na rotina tem muito mais chance de manter.
 *
 * Ela sumiu quando a Hoje foi refeita (o campo continuou no estado, sem nada
 * que o escrevesse) e voltou aqui. Duas regras de posição:
 *  - só aparece enquanto ela NÃO escolheu. Depois de escolhida, ocupar espaço
 *    todo dia com uma pergunta já respondida é ruído;
 *  - a escolha vira o texto do lembrete (ver lib/notifications), então é ela
 *    que faz o push falar a língua da rotina dela em vez de "não esqueça!".
 */
export function RitualCard() {
  const anchor = useAppStore((s) => s.data.ritualAnchor);
  const setRitual = useAppStore((s) => s.setRitual);

  if (anchor) return null;

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <Anchor className="mt-0.5 size-5 shrink-0 text-rose-deep" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold tracking-tight text-ink">
            Quando você vai cuidar de você?
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
            Amarrar a um momento que já existe na sua rotina é o que faz o
            hábito pegar. Escolha o seu:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {RITUAL_ANCHORS.map((a) => (
              <button
                key={a}
                onClick={() => {
                  void haptic("light");
                  void setRitual(a);
                }}
                className="rounded-full bg-cream-deep px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors active:bg-rose-tint"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A âncora já escolhida, para a aba "Eu". Permite trocar. */
export function RitualEscolhido() {
  const anchor = useAppStore((s) => s.data.ritualAnchor);
  const setRitual = useAppStore((s) => s.setRitual);

  if (!anchor) return null;

  return (
    <section className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <Check className="size-5 shrink-0 text-rose-deep" strokeWidth={2.6} />
      <p className="min-w-0 flex-1 text-[15px] text-ink">
        <span className="font-semibold">{anchor}</span>, eu cuido do meu
        intestino.
      </p>
      <button
        onClick={() => void setRitual("")}
        className="shrink-0 text-sm font-semibold text-ink-faint underline-offset-4 active:underline"
      >
        Mudar
      </button>
    </section>
  );
}
