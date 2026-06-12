"use client";

import Link from "next/link";
import { Lock, Check, Sparkles, Trophy } from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { phasesFor, totalDays } from "@/lib/journey";
import { cn } from "@/lib/cn";

export default function Jornada() {
  const progress = useAppStore((s) => s.data.progress);

  const completed = progress?.completedDays ?? [];
  // Na Manutenção mostramos o programa que ela DE FATO fez (senão a página
  // exibiria "14 de 21 · 67%" para sempre, com challengeType sobrescrito).
  const maintenance = progress?.challengeType === "maintenance";
  const challenge = maintenance
    ? Math.max(0, ...completed) > 14
      ? "reset21"
      : "main14"
    : (progress?.challengeType ?? "main14");
  const current = maintenance
    ? Math.max(1, ...completed)
    : (progress?.currentDay ?? 1);
  const total = totalDays(challenge);
  const totalLabel = Number.isFinite(total) ? total : 21;
  const phases = phasesFor(challenge);
  const pct = Math.round((completed.length / totalLabel) * 100);

  return (
    <div className="space-y-6">
      <header className="pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {maintenance
            ? "Programa concluído · Modo Manutenção"
            : challenge === "reset21"
              ? "Reset Profundo"
              : "Desafio Desincha"}
        </p>
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Sua jornada de {totalLabel} dias
        </h1>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-ink-soft">
              {completed.length} de {totalLabel} concluídos
            </span>
            <span className="font-semibold text-sage-deep">{pct}%</span>
          </div>
          <ProgressBar value={completed.length / totalLabel} />
        </div>
      </header>

      {phases.map((phase) => (
        <section key={phase.phase}>
          <div className="mb-2 flex items-center gap-2">
            <Badge tone={phase.tone}>{phase.phase}</Badge>
            <span className="text-sm text-ink-faint">{phase.focus}</span>
          </div>
          <div className="space-y-2">
            {Array.from(
              { length: phase.end - phase.start + 1 },
              (_, i) => phase.start + i
            ).map((d) => {
              const done = completed.includes(d);
              const isCurrent = d === current && !done;
              const locked = d > current;
              const accessible = !locked;
              const milestone = d === 7 || d === 14 || d === 21;

              const inner = (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 transition-all",
                    isCurrent &&
                      "border-sage/40 bg-surface shadow-[var(--shadow-card)]",
                    done && "border-line bg-surface/70",
                    locked && "border-line/70 bg-cream-deep/40",
                    accessible && "active:scale-[0.99]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
                      done && "bg-sage text-white",
                      isCurrent && "bg-coral text-white",
                      locked && "bg-cream-deep text-ink-faint"
                    )}
                  >
                    {done ? (
                      <Check className="size-5" strokeWidth={2.6} />
                    ) : locked ? (
                      <Lock className="size-4" />
                    ) : (
                      d
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "flex items-center gap-1.5 font-semibold tracking-tight",
                        locked ? "text-ink-faint" : "text-ink"
                      )}
                    >
                      Dia {d}
                      {milestone && (
                        <Trophy className="size-3.5 text-gold" />
                      )}
                    </p>
                    <p className="truncate text-sm text-ink-soft">
                      {done
                        ? "Concluído"
                        : isCurrent
                          ? "Seu dia de hoje · toque para abrir"
                          : milestone
                            ? "Marco a desbloquear"
                            : "A desbloquear"}
                    </p>
                  </div>
                  {isCurrent && (
                    <Sparkles className="size-5 shrink-0 text-coral" />
                  )}
                </div>
              );

              return accessible ? (
                <Link key={d} href={`/jornada/${d}`} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={d}>{inner}</div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
