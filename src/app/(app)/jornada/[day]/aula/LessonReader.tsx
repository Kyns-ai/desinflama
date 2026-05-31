"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, Sprout, Trophy } from "lucide-react";
import { Button } from "@/components/ui";
import { Confetti } from "@/components/Confetti";
import { useAppStore } from "@/store/useAppStore";
import { getDay, lessonCards, type QuizItem } from "@/content/journey";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

export function LessonReader({ day }: { day: number }) {
  const router = useRouter();
  const completeLesson = useAppStore((s) => s.completeLesson);

  const content = getDay(day);
  const cards = useMemo(
    () => (content ? lessonCards(content.lesson) : []),
    [content]
  );
  const quiz: QuizItem[] = content?.lesson.quiz ?? [];

  // etapas: cards (0..n-1) → quiz (n..n+q-1) → done
  const totalSteps = cards.length + quiz.length;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [reward, setReward] = useState<{ seeds: number } | null>(null);

  if (!content) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream px-8 text-center">
        <div>
          <p className="text-ink-soft">Aula não encontrada.</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const inCards = step < cards.length;
  const quizIndex = step - cards.length;

  async function finish() {
    const r = await completeLesson(day);
    void haptic("success");
    setReward({ seeds: r.seeds });
    setDone(true);
  }

  function next() {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      setPicked(null);
    } else {
      finish();
    }
  }

  if (done) {
    return (
      <LessonDone
        seeds={reward?.seeds ?? 0}
        milestone={content.milestone}
        onClose={() => router.replace(`/jornada/${day}`)}
      />
    );
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream px-6 pt-safe pb-safe">
      {/* topo: fechar + progresso */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={() => router.replace(`/jornada/${day}`)}
          aria-label="Fechar aula"
          className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <X className="size-5" />
        </button>
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-deep"
            >
              <motion.div
                className="h-full rounded-full bg-sage"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease }}
              />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {inCards ? (
          <motion.div
            key={`card-${step}`}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.32, ease }}
            className="flex flex-1 flex-col justify-center py-8"
          >
            {cards[step].emoji && (
              <div className="text-6xl">{cards[step].emoji}</div>
            )}
            {cards[step].heading && (
              <h1 className="mt-5 font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink">
                {cards[step].heading}
              </h1>
            )}
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
              {cards[step].body}
            </p>
          </motion.div>
        ) : (
          <QuizCard
            key={`quiz-${quizIndex}`}
            item={quiz[quizIndex]}
            picked={picked}
            onPick={setPicked}
          />
        )}
      </AnimatePresence>

      <div className="pb-6">
        <Button
          fullWidth
          size="lg"
          disabled={!inCards && picked === null}
          onClick={next}
        >
          {inCards
            ? step === cards.length - 1 && quiz.length > 0
              ? "Fazer o quiz"
              : "Avançar"
            : quizIndex === quiz.length - 1
              ? "Concluir aula"
              : "Continuar"}
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

function QuizCard({
  item,
  picked,
  onPick,
}: {
  item: QuizItem;
  picked: number | null;
  onPick: (i: number) => void;
}) {
  const answered = picked !== null;
  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.32, ease }}
      className="flex flex-1 flex-col py-8"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-dark">
        Quiz rápido
      </span>
      <h1 className="mt-4 font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-ink">
        {item.question}
      </h1>

      <div className="mt-6 space-y-3">
        {item.options.map((opt, i) => {
          const isCorrect = i === item.correctIndex;
          const isPicked = picked === i;
          const state = !answered
            ? "idle"
            : isCorrect
              ? "correct"
              : isPicked
                ? "wrong"
                : "dim";
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onPick(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                state === "idle" && "border-line bg-surface active:scale-[0.99]",
                state === "correct" && "border-sage bg-sage-tint/60",
                state === "wrong" && "border-danger bg-danger-tint/60",
                state === "dim" && "border-line bg-surface opacity-50"
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2",
                  state === "correct" && "border-sage bg-sage text-white",
                  state === "wrong" && "border-danger bg-danger text-white",
                  (state === "idle" || state === "dim") && "border-line"
                )}
              >
                {answered && isCorrect && <Check className="size-3.5" strokeWidth={3} />}
                {answered && isPicked && !isCorrect && <X className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="font-medium text-ink">{opt}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 rounded-xl px-4 py-3 text-[15px] leading-relaxed",
              picked === item.correctIndex
                ? "bg-sage-tint/50 text-sage-dark"
                : "bg-cream-deep text-ink-soft"
            )}
          >
            {item.explain}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LessonDone({
  seeds,
  milestone,
  onClose,
}: {
  seeds: number;
  milestone?: string;
  onClose: () => void;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-cream px-8 text-center">
      <Confetti />
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="grid size-24 place-items-center rounded-full bg-sage text-white shadow-[var(--shadow-sage)]"
      >
        <Check className="size-12" strokeWidth={3} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink"
      >
        Aula concluída!
      </motion.h1>

      {seeds > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 16 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage-tint px-4 py-2 text-sage-dark"
        >
          <Sprout className="size-5" />
          <span className="font-semibold">+{seeds} semente</span>
        </motion.div>
      )}

      {milestone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9a7322]"
        >
          <Trophy className="size-4" /> {milestone}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 w-full max-w-xs"
      >
        <Button fullWidth size="lg" onClick={onClose}>
          Voltar pro meu dia
        </Button>
      </motion.div>
    </div>
  );
}
