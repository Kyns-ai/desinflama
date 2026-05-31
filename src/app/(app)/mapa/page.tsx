"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Quote } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { Art } from "@/components/Art";
import { useAppStore } from "@/store/useAppStore";
import { artId } from "@/content/cardArt";
import { BLOAT_PROFILES, WELCOME_VIDEO } from "@/content/onboarding";
import type { BloatType, SymptomKey } from "@/types/domain";

const SYMPTOM_LABEL: Record<SymptomKey, { label: string; emoji: string }> = {
  inchaco: { label: "Inchaço", emoji: "🎈" },
  gases: { label: "Gases", emoji: "💨" },
  intestino: { label: "Intestino", emoji: "🚽" },
  energia: { label: "Energia", emoji: "⚡" },
  pele: { label: "Pele", emoji: "✨" },
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

const projection = [
  { when: "72h", label: "barriga mais baixa" },
  { when: "7 dias", label: "1ª vitória visível" },
  { when: "14 dias", label: "intestino reparado" },
];

export default function MapaPage() {
  const router = useRouter();
  const onboarding = useAppStore((s) => s.data.user?.onboarding ?? null);

  const bloatType = (onboarding?.bloatType ?? "fermentacao") as BloatType;
  const p = BLOAT_PROFILES[bloatType];
  const symptoms = onboarding?.symptoms ?? [];

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Seu Mapa de Inchaço
        </h1>
      </header>

      {/* Perfil */}
      <Card elevation="lift">
        <Badge tone="sage">
          <Sparkles className="size-3.5" /> Perfil identificado
        </Badge>
        <Art
          id={`mapa-${bloatType}`}
          emoji={p.emoji}
          className="mt-3 size-20 rounded-2xl text-4xl"
        />
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
          {p.name}
        </h2>
        <p className="mt-1 text-lg font-medium text-sage-deep">{p.tagline}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p.cause}</p>
      </Card>

      {/* O que estamos cuidando */}
      <Card elevation="soft">
        <h3 className="mb-3 font-semibold tracking-tight text-ink">
          O que estamos cuidando em você
        </h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {symptoms.map((s) => {
            const m = SYMPTOM_LABEL[s];
            return (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-3 py-1.5 text-sm text-ink"
              >
                <Art
                  id={artId(m?.emoji) ?? ""}
                  emoji={m?.emoji}
                  className="size-5 rounded-md text-sm"
                />{" "}
                {m?.label}
              </span>
            );
          })}
        </div>
        <dl className="space-y-2 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Objetivo principal</dt>
            <dd className="font-medium text-ink">
              {GOAL_LABEL[onboarding?.goal ?? "desinchar"]}
            </dd>
          </div>
          {onboarding?.worstTime && (
            <div className="flex justify-between">
              <dt className="text-ink-soft">Incha mais</dt>
              <dd className="font-medium text-ink">
                {WHEN_LABEL[onboarding.worstTime]}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Plano */}
      <Card elevation="soft" className="bg-sage-tint/40">
        <h3 className="font-semibold tracking-tight text-ink">Seu plano</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{p.plan}</p>
        <div className="mt-4 flex items-stretch gap-2">
          {projection.map((x) => (
            <div
              key={x.when}
              className="flex-1 rounded-2xl bg-surface px-3 py-3 text-center"
            >
              <div className="font-display text-lg font-semibold text-sage-deep">
                {x.when}
              </div>
              <div className="mt-0.5 text-[11px] leading-tight text-ink-soft">
                {x.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Mensagem da nutri */}
      <Card elevation="soft">
        <div className="mb-2 flex items-center gap-2">
          <Quote className="size-4 text-sage-deep" />
          <h3 className="font-semibold tracking-tight text-ink">
            {WELCOME_VIDEO.title}
          </h3>
        </div>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {WELCOME_VIDEO.transcript}
        </p>
      </Card>
    </div>
  );
}
