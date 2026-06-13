"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wind, Sprout, Check, Info } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { Confetti } from "@/components/Confetti";
import { useAppStore } from "@/store/useAppStore";
import { calmariaForDay, calmariaSeconds, type BreathPattern } from "@/content/calmaria";
import { haptic } from "@/lib/haptics";
import { todayKey } from "@/lib/date";

type Phase = "inhale" | "hold" | "exhale";

interface Segment {
  phase: Phase;
  seconds: number;
}

const PHASE_LABEL: Record<Phase, string> = {
  inhale: "Inspire",
  hold: "Segure",
  exhale: "Solte devagar",
};

function buildSegments(p: BreathPattern, cycles: number): Segment[] {
  const out: Segment[] = [];
  for (let i = 0; i < cycles; i++) {
    out.push({ phase: "inhale", seconds: p.inhale });
    if (p.hold > 0) out.push({ phase: "hold", seconds: p.hold });
    out.push({ phase: "exhale", seconds: p.exhale });
  }
  return out;
}

export default function Calmaria() {
  const router = useRouter();
  const completeCalmaria = useAppStore((s) => s.completeCalmaria);
  const day = useAppStore((s) => s.data.progress?.currentDay ?? 1);
  const doneToday = useAppStore((s) => !!s.data.flags[`calmaria:${todayKey()}`]);

  const session = useMemo(() => calmariaForDay(day), [day]);
  const segments = useMemo(
    () => buildSegments(session.pattern, session.cycles),
    [session]
  );
  const totalSec = calmariaSeconds(session);

  const [stage, setStage] = useState<"intro" | "breathing" | "done">("intro");
  const [segIdx, setSegIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Capturada no mount: completeCalmaria seta a flag no meio da sessão, e a
  // experiência de "primeira vez" precisa valer até a tela final.
  const [primeiraVez] = useState(
    () => !useAppStore.getState().data.flags.primeiroAlivio
  );

  const seg = segments[segIdx];
  const cycleNum = Math.floor(segIdx / (session.pattern.hold > 0 ? 3 : 2)) + 1;

  const finish = useCallback(async () => {
    void haptic("success");
    await completeCalmaria();
    setStage("done");
  }, [completeCalmaria]);

  // Avança os segmentos da respiração no tempo de cada fase. Ao terminar o
  // último, finaliza dentro do callback (não no corpo do effect).
  useEffect(() => {
    if (stage !== "breathing" || segIdx >= segments.length) return;
    timer.current = setTimeout(() => {
      const next = segIdx + 1;
      if (next >= segments.length) {
        void finish();
      } else {
        setSegIdx(next);
      }
    }, segments[segIdx].seconds * 1000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [stage, segIdx, segments, finish]);

  function start() {
    setSegIdx(0);
    setStage("breathing");
    void haptic("light");
  }

  // Escala do círculo conforme a fase (inspira → grande; solta → pequeno).
  const scale = seg?.phase === "inhale" ? 1 : seg?.phase === "exhale" ? 0.55 : 1;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Mente-Intestino
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
            Calmaria
          </h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* ---------------------------- INTRO ---------------------------- */}
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col"
          >
            <div className="flex flex-1 flex-col justify-center gap-5 py-6">
              {primeiraVez && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1 text-xs font-semibold text-coral-dark">
                  ✨ Sua primeira vitória
                </span>
              )}
              <div className="grid size-16 place-items-center rounded-3xl bg-sage-tint">
                <Wind className="size-8 text-sage-deep" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  {primeiraVez
                    ? "Sinta a diferença AGORA — antes de qualquer dieta"
                    : "Um minuto pra acalmar seu intestino"}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {primeiraVez
                    ? "Seu intestino e seu cérebro conversam o tempo todo. Nesta respiração de ~1 minuto, você vai sentir seu corpo sair do modo alerta — hoje, não na semana que vem. É a prova de que isso funciona no SEU corpo."
                    : "Intestino e cérebro conversam. Quando você desacelera a respiração — soltando o ar mais devagar do que puxa — o corpo sai do modo de alerta e o intestino relaxa junto. É a alavanca com mais evidência da jornada, e a mais gentil."}
                </p>
              </div>

              <Card elevation="soft" className="flex items-start gap-3 bg-cream-deep/40">
                <Info className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  Ferramenta de autocuidado para relaxar o eixo intestino-cérebro.
                  Não é hipnoterapia clínica nem substitui avaliação profissional.
                </p>
              </Card>
            </div>

            <div className="space-y-2 pb-6">
              <Button fullWidth size="lg" onClick={start}>
                {primeiraVez
                  ? "Sentir agora"
                  : doneToday
                    ? "Fazer de novo"
                    : "Começar"}{" "}
                · ~{Math.round(totalSec / 60) || 1} min
              </Button>
              {doneToday && (
                <p className="text-center text-sm text-sage-deep">
                  <Check className="mr-1 inline size-4" strokeWidth={3} />
                  Você já fez a Calmaria de hoje
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* -------------------------- BREATHING -------------------------- */}
        {stage === "breathing" && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-10 py-6"
          >
            <div className="relative grid place-items-center">
              {/* halo */}
              <motion.div
                className="absolute rounded-full bg-sage-tint/50"
                animate={{ scale: scale * 1.18 }}
                transition={{ duration: seg?.seconds ?? 4, ease: "easeInOut" }}
                style={{ width: 280, height: 280 }}
              />
              <motion.div
                className="grid size-[200px] place-items-center rounded-full bg-sage text-white shadow-[var(--shadow-sage)]"
                animate={{ scale }}
                transition={{ duration: seg?.seconds ?? 4, ease: "easeInOut" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={seg?.phase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="font-display text-xl font-semibold tracking-tight"
                  >
                    {seg ? PHASE_LABEL[seg.phase] : ""}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-ink-soft">
                Ciclo {Math.min(cycleNum, session.cycles)} de {session.cycles}
              </p>
              <button
                onClick={() => void finish()}
                className="mt-4 text-sm font-semibold text-ink-faint underline-offset-4 transition-colors hover:underline active:text-ink-soft"
              >
                Pular para o final
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------- DONE ---------------------------- */}
        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-1 flex-col"
          >
            <Confetti />
            <div className="flex flex-1 flex-col justify-center gap-5 py-6">
              <div className="grid size-16 place-items-center rounded-3xl bg-sage text-white shadow-[var(--shadow-sage)]">
                <Check className="size-8" strokeWidth={3} />
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 text-sm font-semibold text-sage-dark">
                  <Sprout className="size-4" /> +1 semente
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
                  {session.reframe.heading}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {session.reframe.body}
                </p>
                {primeiraVez && (
                  <p className="mt-4 rounded-2xl bg-sage-tint/50 px-4 py-3 text-[15px] font-medium leading-relaxed text-sage-dark">
                    Primeira vitória registrada ✅ Esse alívio foi você que fez.
                  </p>
                )}
              </div>
            </div>
            <div className="pb-6">
              <Button fullWidth size="lg" onClick={() => router.push("/inicio")}>
                {primeiraVez ? "Ir pro meu Dia 1" : "Pronto"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
