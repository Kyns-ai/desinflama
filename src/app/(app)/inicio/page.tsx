"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  PlayCircle,
  HeartPulse,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ScoreRing, Card, Badge, IconCircle, buttonStyles } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { currentScore, scoreMicrocopy, isScoreStalled } from "@/lib/score";
import { phaseForDay } from "@/lib/journey";
import { lessonTitleFor } from "@/content/journey";
import { humanDate } from "@/lib/date";

const ease = [0.22, 1, 0.36, 1] as const;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Inicio() {
  const data = useAppStore((s) => s.data);
  const { user, progress, streak, scores } = data;

  const score = currentScore(data);
  const day = progress?.currentDay ?? 1;
  const challenge = progress?.challengeType ?? "main14";
  const phase = phaseForDay(day, challenge);
  const stalled = isScoreStalled(scores);
  const firstName = (user?.name ?? "você").split(" ")[0];

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between pt-5">
        <div>
          <p className="text-[15px] text-ink-soft">
            {saudacao()}, {firstName}
          </p>
          <p className="text-sm capitalize text-ink-faint">{humanDate()}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1.5 text-sm font-semibold text-coral-dark">
          <Flame className="size-4" /> {streak.current}
        </span>
      </header>

      {/* Gut Score */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <Card className="flex flex-col items-center py-7" elevation="lift">
          <ScoreRing
            value={score.value}
            from={Math.max(0, score.value - score.delta)}
            delta={score.delta}
          />
          <p className="mt-4 max-w-[16rem] text-center text-[15px] leading-relaxed text-ink-soft">
            {scoreMicrocopy(score.value, score.delta)}
          </p>
        </Card>
      </motion.div>

      {/* Seu dia de hoje */}
      <Link href="/jornada" className="block">
        <Card className="transition-transform active:scale-[0.99]" elevation="card">
          <div className="flex items-center justify-between">
            <Badge tone={phase.tone}>Fase {phase.phase}</Badge>
            <span className="text-sm font-medium text-ink-faint">
              Dia {day} de {challenge === "reset21" ? 21 : 14}
            </span>
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
            Seu dia de hoje
          </h2>
          <p className="mt-1 text-[15px] text-ink-soft">{phase.focus}</p>
          <div
            className={buttonStyles({
              variant: "sage",
              size: "md",
              fullWidth: true,
              className: "mt-4",
            })}
          >
            Ver meu dia <ArrowRight className="size-4" />
          </div>
        </Card>
      </Link>

      {/* Como você está hoje? */}
      <Link href="/registrar" className="block">
        <Card
          elevation="soft"
          className="flex items-center gap-4 bg-gradient-to-br from-surface to-sage-tint/40 transition-transform active:scale-[0.99]"
        >
          <IconCircle icon={HeartPulse} tone="sage" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Como você está hoje?
            </h3>
            <p className="text-sm text-ink-soft">
              30 segundos que melhoram seu Gut Score
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Upsell contextual (slot) — aparece quando o score estaciona */}
      {stalled && (
        <Link href="/perfil" className="block">
          <div className="rounded-2xl border border-gold/30 bg-gold-tint/60 p-5 transition-transform active:scale-[0.99]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#9a7322]" />
              <span className="font-semibold text-[#7c5d18]">
                Seu padrão pede um olhar mais de perto
              </span>
            </div>
            <p className="mt-1.5 text-[15px] text-[#7c5d18]/85">
              Quando o Gut Score trava, uma avaliação individual com a nutri
              costuma destravar. Quer entender suas opções?
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#7c5d18]">
              Ver acompanhamento <ChevronRight className="size-4" />
            </span>
          </div>
        </Link>
      )}

      {/* Aula do dia */}
      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Aula de hoje
        </h2>
        <Link href="/jornada" className="block">
          <Card
            elevation="card"
            className="overflow-hidden p-0 transition-transform active:scale-[0.99]"
          >
            <div className="relative grid h-36 place-items-center bg-gradient-to-br from-sage-deep to-sage-dark">
              <PlayCircle className="size-12 text-white/90" strokeWidth={1.6} />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                3 min
              </span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Entenda seu corpo
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                {lessonTitleFor(day)}
              </h3>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
