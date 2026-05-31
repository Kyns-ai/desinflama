"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Sprout,
  BookOpen,
  HeartPulse,
  ListChecks,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { ScoreRing, Card, Badge, IconCircle, Button, buttonStyles } from "@/components/ui";
import { SeedMeter } from "@/components/SeedMeter";
import { useAppStore } from "@/store/useAppStore";
import { currentScore, scoreMicrocopy, isScoreStalled } from "@/lib/score";
import { leveledUp, type GardenLevel } from "@/lib/garden";
import { phaseForDay, totalDays } from "@/lib/journey";
import { getDay } from "@/content/journey";
import { MONTHLY_CHALLENGES } from "@/content/challenges";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Inicio() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const completeDay = useAppStore((s) => s.completeDay);
  const { user, progress, streak, scores, seeds } = data;

  const score = currentScore(data);
  const day = progress?.currentDay ?? 1;
  const challenge = progress?.challengeType ?? "main14";
  const phase = phaseForDay(day, challenge);
  const total = totalDays(challenge);
  const totalLabel = Number.isFinite(total) ? total : 21;
  const firstName = (user?.name ?? "você").split(" ")[0];
  const stalled = isScoreStalled(scores);

  const content = getDay(day);
  const today = todayKey();
  const aulaDone = !!data.lessonsDone[day];
  const checkinDone = data.logs.some((l) => l.date === today);
  const checklistTotal = content?.checklist.length ?? 0;
  const checklistChecked = data.checklists[day]?.length ?? 0;
  const tarefasDone = checklistTotal > 0 && checklistChecked >= checklistTotal;
  const dayCompleted = progress?.completedDays.includes(day) ?? false;

  const steps: {
    icon: LucideIcon;
    label: string;
    sub: string;
    done: boolean;
    href: string;
    tone: "sage" | "coral" | "sky";
  }[] = [
    {
      icon: BookOpen,
      label: "Aula do dia",
      sub: aulaDone
        ? "Concluída"
        : `${content?.lesson.durationMin ?? 2} min · ${content?.lesson.title ?? ""}`,
      done: aulaDone,
      href: `/jornada/${day}/aula`,
      tone: "sage",
    },
    {
      icon: HeartPulse,
      label: "Check-in de hoje",
      sub: checkinDone ? "Registrado" : "Como você está? 30 segundos",
      done: checkinDone,
      href: "/registrar",
      tone: "coral",
    },
    {
      icon: ListChecks,
      label: "Tarefas e refeições",
      sub: tarefasDone
        ? "Tudo feito"
        : checklistTotal
          ? `${checklistChecked} de ${checklistTotal} tarefas`
          : "Ver o dia",
      done: tarefasDone,
      href: `/jornada/${day}`,
      tone: "sky",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  const [celebrating, setCelebrating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [levelUp, setLevelUp] = useState<GardenLevel | null>(null);

  async function concluirDia() {
    setBusy(true);
    const before = useAppStore.getState().data.seeds;
    await completeDay(day);
    const after = useAppStore.getState().data.seeds;
    setLevelUp(leveledUp(before, after));
    setBusy(false);
    setCelebrating(true);
  }

  // Modo Manutenção tem seu próprio fluxo
  if (challenge === "maintenance") {
    return <MaintenanceHome firstName={firstName} streak={streak.current} seeds={seeds} flags={data.flags} score={score} />;
  }

  if (celebrating && content) {
    const isFinal = day >= totalLabel;
    return (
      <DayCelebration
        message={content.completionMessage}
        milestone={content.milestone}
        levelUp={levelUp}
        onDone={() => {
          setCelebrating(false);
          setLevelUp(null);
          if (isFinal) router.replace("/concluir");
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between pt-5">
        <div>
          <p className="text-[15px] text-ink-soft">{saudacao()},</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/jardim"
            className="inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1.5 text-sm font-semibold text-sage-dark transition-transform active:scale-95"
          >
            <Sprout className="size-4" /> {seeds}
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1.5 text-sm font-semibold text-coral-dark">
            <Flame className="size-4" /> {streak.current}
          </span>
        </div>
      </header>

      {/* Faixa da semana */}
      <WeekStrip day={day} total={totalLabel} completed={progress?.completedDays ?? []} />

      {/* Seu dia de hoje — o ritual */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <Card elevation="lift" className="p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Dia {day} de {totalLabel} · {phase.phase}
              </p>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Seu dia de hoje
              </h2>
            </div>
            <DayRing done={doneCount} total={steps.length} />
          </div>

          <ul className="divide-y divide-line">
            {steps.map((s) => (
              <li key={s.label}>
                <button
                  onClick={() => router.push(s.href)}
                  className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-cream-deep/40"
                >
                  <StepIcon icon={s.icon} done={s.done} tone={s.tone} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-semibold tracking-tight",
                        s.done ? "text-ink-faint line-through" : "text-ink"
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="truncate text-sm text-ink-soft">{s.sub}</p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>

          {!dayCompleted && (
            <div className="p-4">
              <Button
                fullWidth
                size="lg"
                loading={busy}
                variant={allDone ? "primary" : "secondary"}
                onClick={concluirDia}
              >
                {allDone ? `Concluir Dia ${day} 🎉` : `Fechar o dia mesmo assim`}
                {allDone && <ArrowRight className="size-5" />}
              </Button>
              {!allDone && (
                <p className="mt-2 text-center text-xs text-ink-faint">
                  Faltam {steps.length - doneCount} de {steps.length} — mas pode
                  fechar sem culpa 💛
                </p>
              )}
            </div>
          )}
          {dayCompleted && (
            <div className="flex items-center justify-center gap-2 p-4 text-sm font-semibold text-sage-dark">
              <Check className="size-4" strokeWidth={3} /> Dia {day} concluído
            </div>
          )}
        </Card>
      </motion.div>

      {/* Índice Intestinal */}
      <Card className="flex flex-col items-center py-6" elevation="card">
        <ScoreRing
          value={score.value}
          from={Math.max(0, score.value - score.delta)}
          delta={score.delta}
          size={180}
          label="Índice Intestinal"
        />
        <p className="mt-3 max-w-[16rem] text-center text-[15px] leading-relaxed text-ink-soft">
          {scoreMicrocopy(score.value, score.delta)}
        </p>
      </Card>

      {/* Jardim / nível */}
      <SeedMeter />

      {/* Refeições de hoje */}
      {content && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-ink">
            <UtensilsCrossed className="size-4 text-sage-deep" /> Refeições de hoje
          </h2>
          <Link href={`/jornada/${day}`} className="block">
            <Card elevation="soft" className="space-y-2.5 transition-transform active:scale-[0.99]">
              {(
                [
                  ["☕", "Café", content.meals.cafe[0]],
                  ["☀️", "Almoço", content.meals.almoco[0]],
                  ["🌙", "Jantar", content.meals.jantar[0]],
                ] as const
              ).map(([emoji, label, meal]) => (
                <div key={label} className="flex items-center gap-3 text-[15px]">
                  <span className="text-lg">{emoji}</span>
                  <span className="w-16 shrink-0 text-sm font-medium text-ink-faint">
                    {label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">{meal}</span>
                </div>
              ))}
            </Card>
          </Link>
        </section>
      )}

      {/* Upsell quando o score trava */}
      {stalled && (
        <Link href="/acompanhamento" className="block">
          <div className="rounded-2xl border border-gold/30 bg-gold-tint/60 p-5 transition-transform active:scale-[0.99]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#9a7322]" />
              <span className="font-semibold text-[#7c5d18]">
                Seu padrão pede um olhar de perto
              </span>
            </div>
            <p className="mt-1.5 text-[15px] text-[#7c5d18]/85">
              Quando o índice trava, uma avaliação individual costuma destravar.
            </p>
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
            <p className="text-sm text-ink-soft">Aulas, gatilhos, trocas e receitas</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>
    </div>
  );
}

/* ----------------------------- subcomponentes ----------------------------- */

function StepIcon({
  icon: Icon,
  done,
  tone,
}: {
  icon: LucideIcon;
  done: boolean;
  tone: "sage" | "coral" | "sky";
}) {
  const tones = {
    sage: "bg-sage-tint text-sage-dark",
    coral: "bg-coral-tint text-coral-dark",
    sky: "bg-sky-tint text-[#3d6f88]",
  };
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
        done ? "bg-sage text-white" : tones[tone]
      )}
    >
      {done ? <Check className="size-5" strokeWidth={2.8} /> : <Icon className="size-5" />}
    </span>
  );
}

function DayRing({ done, total }: { done: number; total: number }) {
  const size = 48;
  const r = 20;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-cream-deep)" strokeWidth="5" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.7, ease }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-ink">
        {done}/{total}
      </span>
    </div>
  );
}

function WeekStrip({
  day,
  total,
  completed,
}: {
  day: number;
  total: number;
  completed: number[];
}) {
  const weekStart = Math.floor((day - 1) / 7) * 7 + 1;
  const days = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(
    (d) => d <= Math.max(total, 7)
  );
  return (
    <div className="flex justify-between gap-1.5">
      {days.map((d) => {
        const done = completed.includes(d);
        const isCurrent = d === day;
        const future = d > day;
        return (
          <div key={d} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full text-sm font-semibold transition-colors",
                done && "bg-sage text-white",
                isCurrent && !done && "bg-coral text-white ring-4 ring-coral-tint",
                future && "bg-cream-deep text-ink-faint"
              )}
            >
              {done ? <Check className="size-4" strokeWidth={2.8} /> : d}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DayCelebration({
  message,
  milestone,
  levelUp,
  onDone,
}: {
  message: string;
  milestone?: string;
  levelUp?: GardenLevel | null;
  onDone: () => void;
}) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className={cn(
          "grid size-24 place-items-center rounded-full text-white shadow-[var(--shadow-sage)]",
          milestone ? "bg-gold" : "bg-sage"
        )}
      >
        {milestone ? <Trophy className="size-12" /> : <Check className="size-12" strokeWidth={3} />}
      </motion.div>
      {milestone && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-sm font-semibold text-[#9a7322]"
        >
          <Sparkles className="size-4" /> {milestone}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 max-w-sm font-display text-2xl font-semibold leading-snug tracking-tight text-ink"
      >
        {message}
      </motion.h2>

      {levelUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 240, damping: 15 }}
          className="mt-5 rounded-2xl bg-sage-tint px-5 py-3 text-sage-dark"
        >
          <p className="text-3xl">{levelUp.emoji}</p>
          <p className="mt-1 font-semibold">Subiu de nível: {levelUp.name}!</p>
          {levelUp.unlock && (
            <p className="text-sm">Desbloqueou: {levelUp.unlock}</p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 w-full max-w-xs"
      >
        <Button fullWidth size="lg" onClick={onDone}>
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}

function MaintenanceHome({
  firstName,
  streak,
  seeds,
  flags,
  score,
}: {
  firstName: string;
  streak: number;
  seeds: number;
  flags: Record<string, boolean>;
  score: { value: number; delta: number };
}) {
  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between pt-5">
        <div>
          <p className="text-[15px] text-ink-soft">{saudacao()},</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1.5 text-sm font-semibold text-sage-dark">
            <Sprout className="size-4" /> {seeds}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1.5 text-sm font-semibold text-coral-dark">
            <Flame className="size-4" /> {streak}
          </span>
        </div>
      </header>

      <Card elevation="card" className="bg-gradient-to-br from-sage-deep to-sage-dark text-white">
        <Badge tone="gold" className="bg-white/20 text-white">
          Modo Manutenção
        </Badge>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
          Sua leveza, todo dia
        </h2>
        <p className="mt-1 text-[15px] text-white/85">
          Seu intestino está bem — manutenção é o que impede de voltar. Registre,
          observe e mantenha o ritmo.
        </p>
      </Card>

      <Link href="/registrar" className="block">
        <Card elevation="soft" className="flex items-center gap-4 transition-transform active:scale-[0.99]">
          <IconCircle icon={HeartPulse} tone="sage" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">Check-in de hoje</h3>
            <p className="text-sm text-ink-soft">30 segundos · mantém seu índice ({score.value})</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Desafios mensais
        </h2>
        <div className="space-y-3">
          {MONTHLY_CHALLENGES.map((c) => {
            const done = c.dias.filter((d) => flags[`mc:${c.id}:${d.day}`]).length;
            return (
              <Link key={c.id} href={`/desafios/${c.id}`} className="block">
                <Card elevation="soft" className="flex items-center gap-4 transition-transform active:scale-[0.99]">
                  <span className="text-3xl">{c.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold tracking-tight text-ink">{c.nome}</h3>
                    <p className="truncate text-sm text-ink-soft">
                      {done > 0 ? `${done}/${c.dias.length} dias` : c.descricao}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Link href="/aprender" className={buttonStyles({ variant: "secondary", size: "lg", fullWidth: true })}>
        Biblioteca da nutri
      </Link>
    </div>
  );
}
