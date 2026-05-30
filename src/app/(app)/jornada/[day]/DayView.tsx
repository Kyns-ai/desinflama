"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  PlayCircle,
  Coffee,
  Sun,
  Moon,
  Apple,
  ArrowLeftRight,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { getDay } from "@/content/journey";
import { phaseForDay, totalDays } from "@/lib/journey";
import { cn } from "@/lib/cn";

const MEAL_META = [
  { key: "cafe", label: "Café da manhã", icon: Coffee },
  { key: "almoco", label: "Almoço", icon: Sun },
  { key: "jantar", label: "Jantar", icon: Moon },
  { key: "lanche", label: "Lanches", icon: Apple },
] as const;

export function DayView({ day }: { day: number }) {
  const router = useRouter();
  const progress = useAppStore((s) => s.data.progress);
  const checked = useAppStore((s) => s.data.checklists[day] ?? []);
  const toggleItem = useAppStore((s) => s.toggleChecklistItem);
  const completeDay = useAppStore((s) => s.completeDay);
  const ready = useAppStore((s) => s.ready);

  const content = getDay(day);
  const challenge = progress?.challengeType ?? "main14";
  const phase = phaseForDay(day, challenge);
  const total = totalDays(challenge);
  const totalLabel = Number.isFinite(total) ? total : 21;
  const isDone = progress?.completedDays.includes(day) ?? false;
  const isLocked = ready && progress ? day > progress.currentDay : false;

  const [celebrating, setCelebrating] = useState(false);
  const [busy, setBusy] = useState(false);

  // Dia bloqueado → volta para a lista
  useEffect(() => {
    if (isLocked) router.replace("/jornada");
  }, [isLocked, router]);

  if (!content) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center">
        <Sparkles className="size-10 text-sage-deep" />
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">
          Conteúdo a caminho
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          Este dia ainda está sendo preparado pela nutri.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const allChecked = checked.length >= content.checklist.length;

  async function concluir() {
    setBusy(true);
    await completeDay(day);
    setBusy(false);
    setCelebrating(true);
  }

  const isFinalDay =
    (challenge === "main14" && day === 14) ||
    (challenge === "reset21" && day === 21);

  if (celebrating) {
    return (
      <Celebration
        message={content.completionMessage}
        milestone={content.milestone}
        onDone={() =>
          router.replace(isFinalDay ? "/concluir" : "/inicio")
        }
      />
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.push("/jornada")}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone={phase.tone}>Fase {phase.phase}</Badge>
            <span className="text-sm font-medium text-ink-faint">
              Dia {day} de {totalLabel}
            </span>
          </div>
        </div>
        {isDone && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-xs font-semibold text-sage-dark">
            <Check className="size-3.5" strokeWidth={3} /> Concluído
          </span>
        )}
      </header>

      {/* Aula do dia */}
      <Card elevation="card" className="overflow-hidden p-0">
        <div className="relative grid h-40 place-items-center bg-gradient-to-br from-sage-deep to-sage-dark">
          <PlayCircle className="size-12 text-white/90" strokeWidth={1.6} />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
            2–3 min
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Entenda seu corpo
          </p>
          <h1 className="mt-1 font-display text-[1.4rem] font-semibold leading-snug tracking-tight text-ink">
            {content.lesson.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            {content.lesson.body}
          </p>
        </div>
      </Card>

      {/* Checklist */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Seu checklist de hoje
        </h2>
        <Card elevation="soft" className="space-y-1 p-2">
          {content.checklist.map((item, i) => {
            const on = checked.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleItem(day, i)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors active:bg-cream-deep/40"
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-md border-2 transition-all",
                    on ? "border-sage bg-sage" : "border-line"
                  )}
                >
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        <Check className="size-3.5 text-white" strokeWidth={3.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span
                  className={cn(
                    "text-[15px] leading-snug transition-colors",
                    on ? "text-ink-faint line-through" : "text-ink"
                  )}
                >
                  {item}
                </span>
              </button>
            );
          })}
        </Card>
      </section>

      {/* Refeições */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Sugestões de refeição
        </h2>
        <div className="space-y-3">
          {MEAL_META.map((m) => {
            const opts = content.meals[m.key];
            if (!opts || opts.length === 0) return null;
            const Icon = m.icon;
            return (
              <Card key={m.key} elevation="soft">
                <div className="mb-2.5 flex items-center gap-2">
                  <Icon className="size-4.5 text-sage-deep" />
                  <h3 className="font-semibold tracking-tight text-ink">
                    {m.label}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {opts.map((opt, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[15px] leading-snug text-ink-soft"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sage/60" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trocas inteligentes */}
      {content.swaps && content.swaps.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
            Trocas inteligentes
          </h2>
          <Card elevation="soft" className="space-y-2.5">
            {content.swaps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-[15px]">
                <span className="text-ink-faint line-through">{s.de}</span>
                <ArrowLeftRight className="size-4 shrink-0 text-coral" />
                <span className="font-medium text-ink">{s.para}</span>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* Concluir */}
      {!isDone ? (
        <div className="sticky bottom-24 z-10">
          <Button
            fullWidth
            size="lg"
            loading={busy}
            onClick={concluir}
            className={cn(!allChecked && "opacity-95")}
          >
            {allChecked ? `Concluir Dia ${day}` : `Concluir Dia ${day}`}
            <Check className="size-5" strokeWidth={2.6} />
          </Button>
          {!allChecked && (
            <p className="mt-2 text-center text-xs text-ink-faint">
              Você pode concluir mesmo sem marcar tudo — sem culpa 💛
            </p>
          )}
        </div>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={() => router.push("/jornada")}
        >
          Voltar para a jornada
        </Button>
      )}
    </div>
  );
}

/* --------------------------- Celebração --------------------------- */

function Celebration({
  message,
  milestone,
  onDone,
}: {
  message: string;
  milestone?: string;
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
        {milestone ? (
          <Trophy className="size-12" />
        ) : (
          <Check className="size-12" strokeWidth={3} />
        )}
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 w-full max-w-xs"
      >
        <Button fullWidth size="lg" onClick={onDone}>
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}
