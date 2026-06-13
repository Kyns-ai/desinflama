"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Moon, Quote, Sparkles } from "lucide-react";
import { Button, ProgressBar } from "@/components/ui";
import { Art } from "@/components/Art";
import { useAppStore } from "@/store/useAppStore";
import { todayKey } from "@/lib/date";
import { BloatWindowCard } from "@/components/BloatWindowCard";
import { ProtocoloCard } from "@/components/ProtocoloCard";
import {
  QUESTIONS,
  BLOAT_PROFILES,
  WELCOME_VIDEO,
  type AnswerMap,
} from "@/content/onboarding";
import type { BloatType, Goal, SymptomKey } from "@/types/domain";
import { PROJECTION, PROJECTION_NOTE } from "@/content/promise";
import { cn } from "@/lib/cn";

type Phase = "quiz" | "ciclo" | "loading" | "mapa" | "compromisso";
const ease = [0.22, 1, 0.36, 1] as const;

export default function Onboarding() {
  const router = useRouter();
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const setCycleStart = useAppStore((s) => s.setCycleStart);
  const setCommitment = useAppStore((s) => s.setCommitment);
  const startJourney = useAppStore((s) => s.startJourney);

  const [phase, setPhase] = useState<Phase>("quiz");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [cycleStart, setCycleStartLocal] = useState<string | null>(null);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  function valueFor(id: string): string[] {
    const v = (answers as Record<string, unknown>)[id];
    if (Array.isArray(v)) return v as string[];
    return v ? [v as string] : [];
  }

  function advance() {
    if (isLast) setPhase("ciclo");
    else setStep((s) => s + 1);
  }

  function selectSingle(value: string) {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setTimeout(advance, 220);
  }

  function toggleMulti(value: string) {
    setAnswers((a) => {
      const cur = (a[q.id as keyof AnswerMap] as string[] | undefined) ?? [];
      const next = cur.includes(value)
        ? cur.filter((x) => x !== value)
        : [...cur, value];
      return { ...a, [q.id]: next };
    });
  }

  function back() {
    if (step === 0) router.replace("/auth");
    else setStep((s) => s - 1);
  }

  async function finish(commitmentDays: number) {
    await setOnboarding({
      bloatType: (answers.bloatType ?? "fermentacao") as BloatType,
      symptoms: (answers.symptoms ?? []) as SymptomKey[],
      goal: (answers.goal ?? "desinchar") as Goal,
      worstTime: answers.worstTime,
    });
    if (cycleStart) await setCycleStart(cycleStart);
    await startJourney("main14");
    await setCommitment(commitmentDays);
    // o Dia 0 termina numa vitória SENTIDA, não num dashboard:
    // a Calmaria (1 min de respiração) é o alívio imediato do primeiro login
    router.replace("/calmaria");
  }

  if (phase === "ciclo")
    return (
      <CicloStep
        onContinue={(date) => {
          setCycleStartLocal(date);
          setPhase("loading");
        }}
      />
    );
  if (phase === "loading")
    return <MapaLoader onDone={() => setPhase("mapa")} />;
  if (phase === "mapa")
    return (
      <Mapa
        bloatType={(answers.bloatType ?? "fermentacao") as BloatType}
        cycleStart={cycleStart}
        onStart={() => setPhase("compromisso")}
      />
    );
  if (phase === "compromisso") return <CompromissoStep onConfirm={finish} />;

  const selected = valueFor(q.id);
  const canContinue = selected.length > 0;

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream px-6 pt-safe pb-safe">
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={back}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <ProgressBar
          className="flex-1"
          value={0}
          segments={QUESTIONS.length}
          active={step}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.32, ease }}
          className="flex flex-1 flex-col py-8"
        >
          <h1 className="font-display text-[1.85rem] font-semibold leading-tight tracking-tight text-ink">
            {q.title}
          </h1>
          {q.subtitle && (
            <p className="mt-2 text-[15px] text-ink-soft">{q.subtitle}</p>
          )}

          <div className="mt-7 flex-1 space-y-3">
            {q.options.map((opt) => {
              const active = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    q.multi ? toggleMulti(opt.value) : selectSingle(opt.value)
                  }
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                    active
                      ? "border-sage bg-sage-tint/60 shadow-[var(--shadow-soft)]"
                      : "border-line bg-surface"
                  )}
                >
                  {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold tracking-tight text-ink">
                      {opt.label}
                    </span>
                    {opt.desc && (
                      <span className="mt-0.5 block text-sm leading-snug text-ink-soft">
                        {opt.desc}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      active
                        ? "border-sage bg-sage text-white"
                        : "border-line"
                    )}
                  >
                    {active && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          {q.multi && (
            <Button
              fullWidth
              size="lg"
              disabled={!canContinue}
              onClick={advance}
              className="mt-4"
            >
              Continuar <ArrowRight className="size-5" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* --------------------------- Compromisso --------------------------- */

const COMMITMENT_OPTIONS = [
  {
    days: 7,
    label: "7 check-ins",
    desc: "1 semana de constância — o mínimo pro seu corpo mostrar o padrão",
    badge: "mais escolhido",
  },
  {
    days: 14,
    label: "14 check-ins",
    desc: "o programa inteiro, mapeado de ponta a ponta",
  },
  {
    days: 21,
    label: "21 check-ins",
    desc: "modo determinada: programa + reset profundo",
  },
] as const;

/** Ritual de compromisso (commitment device, padrão Simple/Noom): meta de
 *  check-ins escolhida POR ELA + confirmação nominal. Sem botão de pular —
 *  a opção de 7 já é a válvula. */
function CompromissoStep({
  onConfirm,
}: {
  onConfirm: (days: number) => Promise<void>;
}) {
  const user = useAppStore((s) => s.user);
  const firstName = (user?.name ?? "eu").split(" ")[0];
  const [days, setDays] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream px-6 pt-safe pb-safe">
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease }}
        className="flex flex-1 flex-col py-12"
      >
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-dark">
          🤝 Seu compromisso
        </span>
        <Art
          id="compromisso-pacto"
          emoji="🤝"
          className="mt-5 size-20 rounded-2xl text-4xl"
        />
        <h1 className="mt-4 font-display text-[1.85rem] font-semibold leading-tight tracking-tight text-ink">
          Quantos check-ins você se compromete a fazer?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Quem assume um compromisso com nome e número cumpre muito mais.
          Escolha a meta que parece alcançável — dá pra aumentar depois.
        </p>

        <div className="mt-6 space-y-3">
          {COMMITMENT_OPTIONS.map((opt) => {
            const active = days === opt.days;
            return (
              <button
                key={opt.days}
                onClick={() => setDays(opt.days)}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                  active
                    ? "border-sage bg-sage-tint/60 shadow-[var(--shadow-soft)]"
                    : "border-line bg-surface"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold tracking-tight text-ink">
                      {opt.label}
                    </span>
                    {"badge" in opt && opt.badge && (
                      <span className="rounded-full bg-coral-tint px-2 py-0.5 text-[11px] font-semibold text-coral-dark">
                        {opt.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-ink-soft">
                    {opt.desc}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    active ? "border-sage bg-sage text-white" : "border-line"
                  )}
                >
                  {active && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {days !== null && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl bg-cream-deep/60 px-4 py-3 text-center font-display text-lg font-semibold leading-snug text-ink"
            >
              “Eu, {firstName}, vou fazer {days} check-ins — um por dia, no meu
              ritmo.”
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-auto space-y-3 pt-8">
          <Button
            fullWidth
            size="lg"
            disabled={days === null}
            loading={busy}
            onClick={async () => {
              if (days === null) return;
              setBusy(true);
              await onConfirm(days);
            }}
          >
            Assumo esse compromisso <ArrowRight className="size-5" />
          </Button>
          <p className="text-center text-xs leading-relaxed text-ink-faint">
            E te pedimos só isso: faça 7 check-ins antes de decidir se isso
            funciona pra você — é o tempo que o corpo leva pra mostrar o
            padrão.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Ciclo ------------------------------ */

/** Pergunta opcional de ciclo: destrava a previsão de janela de inchaço
 *  hormonal — o "uau" da 1ª sessão. Sempre pulável, sem culpa. */
function CicloStep({ onContinue }: { onContinue: (date: string | null) => void }) {
  const [date, setDate] = useState("");
  const today = todayKey();

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream px-6 pt-safe pb-safe">
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease }}
        className="flex flex-1 flex-col py-12"
      >
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-plum-tint px-3 py-1 text-xs font-semibold text-plum">
          <Moon className="size-3.5" /> Opcional — mas vale ouro
        </span>
        <Art
          id="ciclo-lua"
          emoji="🌙"
          className="mt-5 size-20 rounded-2xl text-4xl"
        />
        <h1 className="mt-4 font-display text-[1.85rem] font-semibold leading-tight tracking-tight text-ink">
          Quando começou sua última menstruação?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Seu ciclo mexe no inchaço. Com essa data, a gente te avisa quando o
          inchaço for hormonal — pra você saber que é fase, não recaída.
        </p>

        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="mt-7 w-full rounded-2xl border border-line bg-surface p-4 text-base text-ink outline-none focus:border-sage"
        />

        <div className="mt-auto space-y-3 pt-8">
          <Button
            fullWidth
            size="lg"
            disabled={!date}
            onClick={() => onContinue(date || null)}
          >
            Continuar <ArrowRight className="size-5" />
          </Button>
          <button
            onClick={() => onContinue(null)}
            className="w-full py-2 text-sm font-medium text-ink-faint"
          >
            Pular — não menstruo / prefiro não dizer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------- Loader (serif) --------------------------- */

function MapaLoader({ onDone }: { onDone: () => void }) {
  const steps = [
    "Lendo suas respostas…",
    "Cruzando com os padrões de inchaço…",
    "Montando seu Mapa de Inchaço…",
  ];
  const [i, setI] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setI(1), 900);
    const t2 = setTimeout(() => setI(2), 1800);
    const t3 = setTimeout(onDone, 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8 size-20">
          <div className="absolute inset-0 rounded-full border-4 border-cream-deep" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-sage [animation-duration:1s]" />
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles className="size-7 text-sage-deep" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="font-display text-2xl font-semibold tracking-tight text-ink"
          >
            {steps[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------ Mapa ------------------------------ */

function Mapa({
  bloatType,
  cycleStart,
  onStart,
}: {
  bloatType: BloatType;
  cycleStart: string | null;
  onStart: () => void;
}) {
  const p = BLOAT_PROFILES[bloatType];

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-cream px-6 pt-safe pb-safe">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="flex flex-col py-8"
      >
        <Reveal>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-dark">
            <Sparkles className="size-3.5" /> Seu Mapa de Inchaço
          </span>
        </Reveal>

        <Reveal>
          <Art
            id={`mapa-${bloatType}`}
            emoji={p.emoji}
            className="mt-5 size-20 rounded-2xl text-4xl"
          />
        </Reveal>
        <Reveal>
          <h1 className="mt-3 font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink">
            {p.name}
          </h1>
        </Reveal>
        <Reveal>
          <p className="mt-1 text-lg font-medium text-sage-deep">{p.tagline}</p>
        </Reveal>

        <Reveal>
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Por que isso acontece
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              {p.cause}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-3 flex items-stretch gap-2">
            {PROJECTION.map((x) => (
              <div
                key={x.when}
                className="flex-1 rounded-2xl bg-cream-deep/60 px-3 py-3 text-center"
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
        </Reveal>

        <Reveal>
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">
            {PROJECTION_NOTE}
          </p>
        </Reveal>

        {cycleStart && (
          <Reveal>
            <div className="mt-3">
              <BloatWindowCard cycleStart={cycleStart} />
            </div>
          </Reveal>
        )}

        {/* Artefato do Dia 0: ela já sai do reveal com algo DELA pra guardar */}
        <Reveal>
          <div className="mt-3">
            <ProtocoloCard bloatType={bloatType} cycleStart={cycleStart} />
          </div>
        </Reveal>

        {/* Mensagem de boas-vindas da nutri */}
        <Reveal>
          <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-center gap-2">
              <Quote className="size-4 text-sage-deep" />
              <h3 className="font-semibold tracking-tight text-ink">
                {WELCOME_VIDEO.title}
              </h3>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              {WELCOME_VIDEO.transcript}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-5 text-center text-[15px] text-ink-soft">{p.plan}</p>
        </Reveal>

        <Reveal>
          <Button fullWidth size="lg" className="mt-5" onClick={onStart}>
            Continuar <ArrowRight className="size-5" />
          </Button>
        </Reveal>
      </motion.div>
    </div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}
