"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Lock, ChevronDown, RotateCcw, Trophy } from "lucide-react";
import { Card, Button, ProgressBar, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { getChallenge } from "@/content/challenges";
import { cn } from "@/lib/cn";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";

export function ChallengeView({ id }: { id: string }) {
  const router = useRouter();
  const flags = useAppStore((s) => s.data.flags);
  const completeChallengeDay = useAppStore((s) => s.completeChallengeDay);
  const update = useAppStore((s) => s.update);

  const challenge = getChallenge(id);
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  if (!challenge) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="text-ink-soft">Desafio não encontrado.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const isDone = (day: number) => !!flags[`mc:${challenge.id}:${day}`];
  const doneCount = challenge.dias.filter((d) => isDone(d.day)).length;
  const allDone = doneCount === challenge.dias.length;
  const nextDay =
    challenge.dias.find((d) => !isDone(d.day))?.day ?? challenge.dias.length;

  async function concluir(day: number) {
    setBusy(day);
    await completeChallengeDay(challenge!.id, day);
    setBusy(null);
    setOpen(null);
  }

  async function refazer() {
    await update((d) => {
      for (const dia of challenge!.dias) delete d.flags[`mc:${challenge!.id}:${dia.day}`];
    });
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.push("/inicio")}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <Art
          id={artId(challenge.emoji) ?? ""}
          emoji={challenge.emoji}
          className="size-11 shrink-0 rounded-2xl text-3xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
            {challenge.nome}
          </h1>
        </div>
      </header>

      <Card elevation="soft">
        <p className="text-[15px] text-ink-soft">{challenge.descricao}</p>
        <div className="mt-3">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-ink-soft">
              {doneCount} de {challenge.dias.length} dias
            </span>
            <span className="font-semibold text-rose-deep">
              {Math.round((doneCount / challenge.dias.length) * 100)}%
            </span>
          </div>
          <ProgressBar value={doneCount / challenge.dias.length} tone="coral" />
        </div>
      </Card>

      {/* Desafio fechado merece celebração — e pode ser refeito */}
      {allDone && (
        <Card
          elevation="lift"
          className="flex items-center gap-4 border border-gold/30 bg-gold-tint/40"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-white">
            <Trophy className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
 Desafio concluído
            </h3>
            <p className="text-sm text-ink-soft">
              {challenge.dias.length} dias fechados. Quer rodar de novo?
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={refazer}>
            <RotateCcw className="size-4" /> Refazer
          </Button>
        </Card>
      )}

      <div className="space-y-2">
        {challenge.dias.map((d) => {
          const done = isDone(d.day);
          const locked = d.day > nextDay;
          const isOpen = open === d.day;
          return (
            <Card key={d.day} elevation="soft" className="overflow-hidden p-0">
              <button
                onClick={() => !locked && setOpen(isOpen ? null : d.day)}
                className="flex w-full items-center gap-3 p-4 text-left"
                disabled={locked}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold",
                    done && "bg-rose text-white",
                    !done && !locked && "bg-coral text-white",
                    locked && "bg-cream-deep text-ink-faint"
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : locked ? (
                    <Lock className="size-3.5" />
                  ) : (
                    d.day
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-semibold leading-snug tracking-tight",
                      locked ? "text-ink-faint" : "text-ink"
                    )}
                  >
                    Dia {d.day} · {d.title}
                  </span>
                </span>
                {!locked && (
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-ink-faint transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-4 pb-4">
                      <p className="text-[15px] leading-relaxed text-ink-soft">
                        {d.body}
                      </p>
                      <ul className="space-y-1.5">
                        {d.checklist.map((item, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-[15px] leading-snug text-ink"
                          >
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-coral/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      {done ? (
                        <Badge tone="rose">
                          <Check className="size-3.5" strokeWidth={3} /> Concluído
                        </Badge>
                      ) : (
                        <Button
                          fullWidth
                          loading={busy === d.day}
                          onClick={() => concluir(d.day)}
                        >
                          Concluir Dia {d.day}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
