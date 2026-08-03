"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Quote } from "lucide-react";
import { Card } from "@/components/ui";
import { Art } from "@/components/Art";
import { BloatWindowCard } from "@/components/BloatWindowCard";
import { ProtocoloCard } from "@/components/ProtocoloCard";
import { ToleranceMapCard } from "@/components/ToleranceMapCard";
import { useAppStore } from "@/store/useAppStore";
import { BLOAT_PROFILES, WELCOME_VIDEO } from "@/content/onboarding";
import { PROJECTION, PROJECTION_NOTE } from "@/content/promise";
import type { BloatType, SymptomKey } from "@/types/domain";
import { cn } from "@/lib/cn";

/**
 * Seu Mapa de Inchaço.
 *
 * Era sete cartões brancos idênticos empilhados numa tela quilométrica — a
 * mesma "sopa de card" que a Hoje tinha. Reestruturado no mesmo esqueleto:
 * campo de cor no topo com QUEM ELA É, o entregável (Mapa de Tolerância) como
 * o cartão em destaque, e o resto em faixa compacta ou recolhido.
 */

/**
 * Sintoma → id da arte, direto.
 *
 * Antes isto guardava o emoji e chamava `artId(emoji)` para traduzir. Passar
 * pelo emoji não servia pra nada aqui (o id é fixo e conhecido) e ainda
 * deixava emoji no arquivo de uma tela, que é o que a regra proíbe.
 */
const SINTOMA: Record<SymptomKey, { label: string; arte: string }> = {
  inchaco: { label: "Inchaço", arte: "card-balao" },
  gases: { label: "Gases", arte: "card-gases" },
  intestino: { label: "Intestino", arte: "card-intestino" },
  energia: { label: "Energia", arte: "card-energia" },
  pele: { label: "Pele", arte: "card-brilho" },
};

const GOAL_LABEL: Record<string, string> = {
  desinchar: "Desinchar a barriga",
  energia: "Ter mais energia",
  pele: "Melhorar a pele",
  digestao: "Digerir sem desconforto",
  rotina: "Criar uma rotina saudável",
};

const WHEN_LABEL: Record<string, string> = {
  manha: "de manhã",
  tarde: "ao longo do dia",
  noite: "à noite",
  refeicoes: "logo depois de comer",
};

export default function MapaPage() {
  const router = useRouter();
  const onboarding = useAppStore((s) => s.data.user?.onboarding ?? null);
  const cycleStart = useAppStore((s) => s.data.cycleStart ?? null);

  const bloatType = (onboarding?.bloatType ?? "fermentacao") as BloatType;
  const p = BLOAT_PROFILES[bloatType];
  const symptoms = onboarding?.symptoms ?? [];

  return (
    <div className="pb-4">
      {/* ---------------- campo de cor: quem ela é ---------------- */}
      <div className="-mx-5 -mt-safe bg-rose-dark px-5 pt-safe">
        <div className="pb-9 pt-3">
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="-ml-2 grid size-10 place-items-center rounded-full text-white/70 transition-colors active:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="mt-3 flex items-start gap-4">
            <Art
              id={`mapa-${bloatType}`}
              className="size-[72px] shrink-0 rounded-2xl bg-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="text-label font-semibold uppercase tracking-[0.06em] text-white/55">
                Seu perfil
              </p>
              <h1 className="mt-1 font-display text-h2 font-semibold text-white">
                {p.name}
              </h1>
              <p className="mt-0.5 text-[15px] font-medium text-white/75">
                {p.tagline}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            {p.cause}
          </p>

          {/* Sintomas e objetivo em linha, não em cartão: é contexto, não ação */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {symptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1.5 text-[13px] font-medium text-white/85"
              >
                <Art id={SINTOMA[s]?.arte ?? ""} className="size-4 rounded" />
                {SINTOMA[s]?.label}
              </span>
            ))}
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-white/15 pt-3.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-white/55">Objetivo</dt>
              <dd className="font-medium text-white/90">
                {GOAL_LABEL[onboarding?.goal ?? "desinchar"]}
              </dd>
            </div>
            {onboarding?.worstTime && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Incha mais</dt>
                <dd className="font-medium text-white/90">
                  {WHEN_LABEL[onboarding.worstTime]}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* ---------------- a folha creme ---------------- */}
      <div className="relative -mx-5 -mt-4 space-y-5 rounded-t-[2rem] bg-cream px-5 pt-6">
        {/* O entregável central vem primeiro — é o que ela veio ver */}
        <ToleranceMapCard />

        <BloatWindowCard cycleStart={cycleStart} />

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold tracking-tight text-ink">Seu plano</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
            {p.plan}
          </p>
          <div className="mt-4 flex items-stretch gap-2">
            {PROJECTION.map((x) => (
              <div
                key={x.when}
                className="flex-1 rounded-xl bg-cream-deep/60 px-2 py-2.5 text-center"
              >
                <div className="font-display text-[15px] font-semibold text-rose-dark">
                  {x.when}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-ink-soft">
                  {x.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-ink-faint">
            {PROJECTION_NOTE}
          </p>
        </section>

        <ProtocoloCard bloatType={bloatType} cycleStart={cycleStart} />

        {/* A mensagem da nutri é longa e ela lê UMA vez — recolhida por padrão,
            senão empurra o resto da tela pra baixo pra sempre. */}
        <Recolhivel titulo={WELCOME_VIDEO.title}>
          {WELCOME_VIDEO.transcript}
        </Recolhivel>
      </div>
    </div>
  );
}

function Recolhivel({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <Card elevation="soft" className="p-0">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left"
      >
        <Quote className="size-4 shrink-0 text-rose-deep" />
        <span className="min-w-0 flex-1 font-semibold tracking-tight text-ink">
          {titulo}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-ink-faint transition-transform",
            aberto && "rotate-180"
          )}
        />
      </button>
      {aberto && (
        <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-soft">
          {children}
        </p>
      )}
    </Card>
  );
}
