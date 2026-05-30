"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  HeartPulse,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { ScoreRing, Card, Badge, IconCircle, buttonStyles } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { currentScore, scoreMicrocopy, isScoreStalled } from "@/lib/score";
import { phaseForDay } from "@/lib/journey";
import { lessonTitleFor } from "@/content/journey";
import { MONTHLY_CHALLENGES } from "@/content/challenges";
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

      {/* Índice Intestinal */}
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

      {/* Seu dia de hoje (jornada) ou Manutenção */}
      {challenge === "maintenance" ? (
        <MaintenanceBlock flags={data.flags} />
      ) : (
        <Link href={`/jornada/${day}`} className="block">
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
      )}

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
              30 segundos que melhoram seu Índice Intestinal
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Upsell contextual (slot) — aparece quando o score estaciona */}
      {stalled && (
        <Link href="/acompanhamento" className="block">
          <div className="rounded-2xl border border-gold/30 bg-gold-tint/60 p-5 transition-transform active:scale-[0.99]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#9a7322]" />
              <span className="font-semibold text-[#7c5d18]">
                Seu padrão pede um olhar mais de perto
              </span>
            </div>
            <p className="mt-1.5 text-[15px] text-[#7c5d18]/85">
              Quando o Índice Intestinal trava, uma avaliação individual com a nutri
              costuma destravar. Quer entender suas opções?
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#7c5d18]">
              Ver acompanhamento <ChevronRight className="size-4" />
            </span>
          </div>
        </Link>
      )}

      {/* Biblioteca */}
      <Link href="/aprender" className="block">
        <Card
          elevation="soft"
          className="flex items-center gap-4 transition-transform active:scale-[0.99]"
        >
          <IconCircle icon={BookOpen} tone="plum" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Aprender com a nutri
            </h3>
            <p className="text-sm text-ink-soft">
              Aulas, gatilhos, trocas e receitas
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Aula do dia */}
      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Aula de hoje
        </h2>
        <Link href={`/jornada/${day}`} className="block">
          <Card
            elevation="card"
            className="flex items-center gap-4 transition-transform active:scale-[0.99]"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sage-deep to-sage-dark text-white">
              <BookOpen className="size-6" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Leitura · 3 min
              </p>
              <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                {lessonTitleFor(day)}
              </h3>
            </div>
            <ChevronRight className="size-5 shrink-0 text-ink-faint" />
          </Card>
        </Link>
      </div>
    </div>
  );
}

function MaintenanceBlock({ flags }: { flags: Record<string, boolean> }) {
  return (
    <div className="space-y-4">
      <Card elevation="card" className="bg-gradient-to-br from-sage-deep to-sage-dark text-white">
        <Badge tone="gold" className="bg-white/20 text-white">
          Modo Manutenção
        </Badge>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
          Sua leveza, todo dia
        </h2>
        <p className="mt-1 text-[15px] text-white/85">
          Seu intestino está bem agora — manutenção é o que impede de voltar.
          Registre, observe e mantenha o ritmo.
        </p>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Desafios mensais
        </h2>
        <div className="space-y-3">
          {MONTHLY_CHALLENGES.map((c) => {
            const done = c.dias.filter(
              (d) => flags[`mc:${c.id}:${d.day}`]
            ).length;
            const pct = Math.round((done / c.dias.length) * 100);
            return (
              <Link key={c.id} href={`/desafios/${c.id}`} className="block">
                <Card
                  elevation="soft"
                  className="flex items-center gap-4 transition-transform active:scale-[0.99]"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold tracking-tight text-ink">
                      {c.nome}
                    </h3>
                    <p className="truncate text-sm text-ink-soft">
                      {done > 0 ? `${done}/${c.dias.length} dias · ${pct}%` : c.descricao}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
