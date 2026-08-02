"use client";

/**
 * Tracker "Suas primeiras 72h" — estrutura os dias 1–3 (a janela onde nasce o
 * reembolso) com 3 vitórias pequenas e verificáveis. Ao fechar as três:
 * celebração + expectativa honesta ("a transformação aparece na semana 2–3").
 */
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Wind, HeartPulse, ArrowLeftRight, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";
import { Confetti } from "@/components/Confetti";
import { Art } from "@/components/Art";
import { useAppStore } from "@/store/useAppStore";
import { todayKey, diffDays } from "@/lib/date";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

export function Tracker72h() {
  const data = useAppStore((s) => s.data);
  const update = useAppStore((s) => s.update);
  const { progress, logs, flags } = data;

  if (!progress?.startedAt) return null;
  // dias-calendário 1–3 desde o início (mesma conversão TZ do recap)
  const startKey = todayKey(new Date(progress.startedAt));
  const elapsed = diffDays(todayKey(), startKey);
  if (elapsed > 2) return null;

  const vitorias = [
    {
      icon: Wind,
      label: "Alívio de 1 minuto",
      sub: "Respiração que acalma o intestino agora",
      done: !!flags.primeiroAlivio,
      href: "/calmaria",
    },
    {
      icon: HeartPulse,
      label: "1º check-in",
      sub: "30 segundos — vira a base do seu mapa",
      done: logs.length >= 1,
      href: "/registrar",
    },
    {
      icon: ArrowLeftRight,
      label: "1 troca no prato",
      sub: "Troque 1 alimento Inflama por 1 Calma hoje",
      done: !!flags.trocaFeita,
      href: "/semaforo",
      selfCheck: true,
    },
  ];
  const doneCount = vitorias.filter((v) => v.done).length;
  const allDone = doneCount === 3;
  const justCelebrated = allDone && !flags.tracker72hCelebrado;

  async function marcarTroca() {
    void haptic("success");
    await update((d) => {
      d.flags.trocaFeita = true;
    });
  }

  async function celebrar() {
    await update((d) => {
      d.flags.tracker72hCelebrado = true;
    });
  }

  if (allDone && flags.tracker72hCelebrado) {
    return (
      <Card elevation="soft" className="flex items-center gap-3 bg-rose-tint/40">
 <Art id="tracker-72h" className="size-10 shrink-0 rounded-xl text-xl" />
        <p className="text-sm leading-snug text-ink">
 <strong className="font-semibold">72h bem começadas </strong>{""}
          <span className="text-ink-soft">
            O desinchaço de hoje você sente hoje — a transformação aparece na
            semana 2–3.
          </span>
        </p>
      </Card>
    );
  }

  return (
    <Card elevation="card" className="relative overflow-hidden p-0">
      {justCelebrated && <Confetti />}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
 <Art id="tracker-72h" className="size-10 shrink-0 rounded-xl text-xl" />
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Suas primeiras 72h
            </h2>
            <p className="text-xs text-ink-soft">
              Três vitórias pequenas que mudam sua primeira semana
            </p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-rose-deep">
          {doneCount}/3
        </span>
      </div>

      <ul className="divide-y divide-line">
        {vitorias.map((v) => {
          const Icon = v.icon;
          const inner = (
            <>
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
                  v.done ? "bg-rose text-white" : "bg-cream-deep text-ink-soft"
                )}
              >
                {v.done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <Check className="size-5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <Icon className="size-5" />
                )}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span
                  className={cn(
                    "block text-[15px] font-semibold tracking-tight",
                    v.done ? "text-ink-faint line-through" : "text-ink"
                  )}
                >
                  {v.label}
                </span>
                {!v.done && (
                  <span className="block text-sm leading-snug text-ink-soft">
                    {v.sub}
                  </span>
                )}
              </span>
            </>
          );

          if (v.done)
            return (
              <li key={v.label} className="flex items-center gap-3 px-5 py-3.5">
                {inner}
              </li>
            );

          if (v.selfCheck)
            return (
              <li key={v.label} className="flex items-center gap-3 px-5 py-3.5">
                {inner}
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <button
                    onClick={marcarTroca}
                    className="rounded-full bg-rose px-3 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95"
                  >
 Fiz uma troca
                  </button>
                  <Link href={v.href} className="text-[11px] font-medium text-ink-faint">
                    ver o semáforo
                  </Link>
                </span>
              </li>
            );

          return (
            <li key={v.label}>
              <Link
                href={v.href}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors active:bg-cream-deep/40"
              >
                {inner}
                <ChevronRight className="size-5 shrink-0 text-ink-faint" />
              </Link>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {justCelebrated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="border-t border-line bg-rose-tint/40 px-5 py-4">
              <p className="font-display text-lg font-semibold tracking-tight text-ink">
 72h bem começadas!
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Verdade de nutri: o desinchaço de hoje você sente hoje — a
                transformação de verdade aparece na semana 2–3. Continue nos
                check-ins que eu te mostro o seu padrão.
              </p>
              <button
                onClick={celebrar}
                className="mt-3 text-sm font-semibold text-rose-deep"
              >
 Bora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/** Linha fina de progresso do compromisso assumido no onboarding. */
export function CommitmentStrip() {
  const data = useAppStore((s) => s.data);
  const { commitmentDays, commitmentAt, logs, user } = data;
  if (!commitmentDays || !commitmentAt) return null;

  const sinceKey = todayKey(new Date(commitmentAt));
  const n = new Set(
    logs.filter((l) => diffDays(l.date, sinceKey) >= 0).map((l) => l.date)
  ).size;
  const firstName = (user?.name ?? "você").split(" ")[0];
  const done = n >= commitmentDays;

  return (
    <div className="rounded-2xl bg-cream-deep/50 px-4 py-2.5">
      {done ? (
        <p className="text-sm font-medium text-rose-dark">
 Compromisso cumprido, {firstName} — agora você já sabe que consegue.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink-soft">
              Check-in {Math.min(n + 1, commitmentDays)} de {commitmentDays} do
              seu compromisso
            </span>
            <span className="font-semibold text-rose-deep">
              {n}/{commitmentDays}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-deep">
            <motion.div
              className="h-full rounded-full bg-rose"
              initial={false}
              animate={{ width: `${Math.min(100, (n / commitmentDays) * 100)}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </>
      )}
    </div>
  );
}
