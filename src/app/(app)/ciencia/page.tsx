"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  X,
  HeartHandshake,
  ShieldCheck,
  ExternalLink,
  Wind,
  Info,
} from "lucide-react";
import { Card, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import {
  VALIDATION,
  CAN_DO,
  CANNOT_DO,
  SCIENCE_SOURCES,
  DISCLAIMER,
  SAFETY_QUESTIONS,
  safetyAtRisk,
} from "@/content/science";

export default function Ciencia() {
  const router = useRouter();
  const update = useAppStore((s) => s.update);
  const gentleMode = useAppStore((s) => !!s.data.flags.gentleMode);
  const safetyChecked = useAppStore((s) => !!s.data.flags.safetyChecked);

  const [checking, setChecking] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Confiança e ciência
        </h1>
      </header>

      {/* Validação */}
      <Card elevation="lift" className="bg-gradient-to-br from-coral-tint/50 to-cream">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral-tint text-coral-dark">
            <HeartHandshake className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              {VALIDATION.title}
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
              {VALIDATION.body}
            </p>
          </div>
        </div>
      </Card>

      {/* O que o programa pode / não pode */}
      <section className="grid gap-3">
        <Card elevation="soft">
          <h3 className="mb-3 font-semibold tracking-tight text-ink">
            O que este programa pode fazer
          </h3>
          <ul className="space-y-2.5">
            {CAN_DO.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink-soft">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-rose text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Card>

        <Card elevation="soft">
          <h3 className="mb-3 font-semibold tracking-tight text-ink">
            O que NÃO podem (e quem promete está te enganando)
          </h3>
          <ul className="space-y-2.5">
            {CANNOT_DO.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink-soft">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-cream-deep text-ink-faint">
                  <X className="size-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Autochecagem de segurança */}
      <Card elevation="soft" className="border border-rose/20 bg-rose-tint/30">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-rose-deep" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Autochecagem de segurança
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Dieta restritiva não é pra todo mundo. Em 30 segundos, vemos se um
              caminho mais cuidadoso (sem restrição) faz mais sentido pra você
              agora. É privado e fica só no seu aparelho.
            </p>
            {gentleMode && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1 text-xs font-semibold text-coral-dark">
                <Wind className="size-3.5" /> Modo gentil ativo (foco em calma, sem restrição)
              </p>
            )}
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => setChecking(true)}
            >
              {safetyChecked ? "Refazer a checagem" : "Fazer a autochecagem"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Como sabemos disso (fontes) */}
      <section>
        <h3 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Como sabemos disso
        </h3>
        <div className="space-y-2.5">
          {SCIENCE_SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card
                elevation="soft"
                className="flex items-start gap-3 transition-transform active:scale-[0.99]"
              >
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-soft">
                  {s.claim}
                </p>
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-ink-faint" />
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Aviso */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-cream-deep/50 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-ink-faint" />
        <p className="text-[13px] leading-relaxed text-ink-faint">{DISCLAIMER}</p>
      </div>

      <AnimatePresence>
        {checking && (
          <SafetyCheck
            onClose={() => setChecking(false)}
            onResult={async (atRisk) => {
              await update((d) => {
                d.flags.safetyChecked = true;
                d.flags.gentleMode = atRisk;
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------- Autochecagem (modal) ------------------------- */

function SafetyCheck({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (atRisk: boolean) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<null | boolean>(null);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === SAFETY_QUESTIONS.length;

  async function finish() {
    const yes = Object.values(answers).filter(Boolean).length;
    const atRisk = safetyAtRisk(yes);
    setDone(atRisk);
    await onResult(atRisk);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-[var(--shadow-lift)]"
      >
        {done === null ? (
          <>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Só pra te cuidar melhor
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Responda com sinceridade. É privado e não é diagnóstico.
            </p>
            <div className="mt-4 space-y-3">
              {SAFETY_QUESTIONS.map((q) => (
                <div key={q.id}>
                  <p className="text-[15px] text-ink">{q.text}</p>
                  <div className="mt-2 flex gap-2">
                    {[
                      { v: true, label: "Sim" },
                      { v: false, label: "Não" },
                    ].map((opt) => {
                      const active = answers[q.id] === opt.v;
                      return (
                        <button
                          key={opt.label}
                          onClick={() =>
                            setAnswers((a) => ({ ...a, [q.id]: opt.v }))
                          }
                          className={
                            "h-10 flex-1 rounded-xl text-sm font-semibold transition-all active:scale-95 " +
                            (active
                              ? "bg-rose text-white shadow-[var(--shadow-rose)]"
                              : "bg-cream-deep text-ink-soft hover:bg-line")
                          }
                          aria-pressed={active}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <Button
              fullWidth
              size="lg"
              className="mt-5"
              disabled={!allAnswered}
              onClick={finish}
            >
              Ver resultado
            </Button>
          </>
        ) : done ? (
          <>
            <span className="grid size-12 place-items-center rounded-2xl bg-coral-tint text-coral-dark">
              <HeartHandshake className="size-6" />
            </span>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
              Vamos com mais cuidado
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Suas respostas sugerem que uma dieta restritiva pode não ser o
              melhor caminho pra você agora — e tudo bem. Ativamos o{" "}
              <strong className="text-ink">modo gentil</strong>: foco na Calmaria
              (respiração e relaxamento, sem restrição de alimentos). Vale também
              conversar com um médico, nutricionista ou psicólogo. Se precisar
              falar com alguém agora, o CVV atende no <strong>188</strong>, 24h,
              de graça.
            </p>
            <Button fullWidth size="lg" className="mt-5" onClick={onClose}>
              Entendi, obrigada
            </Button>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-2xl bg-rose text-white">
              <Check className="size-6" strokeWidth={3} />
            </span>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
              Pode seguir tranquila
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Nada na sua checagem pede cuidado extra agora. Mesmo assim, a regra
              da casa vale: a gente nunca recompensa restringir mais ou por mais
              tempo. Se algo mudar, refaça a checagem quando quiser.
            </p>
            <Button fullWidth size="lg" className="mt-5" onClick={onClose}>
              Continuar
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
