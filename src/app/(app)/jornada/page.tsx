"use client";

import { Lock, Check, Sparkles } from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/cn";

// Semente da Fase 0 — a Fase 4 conecta ao progresso real e abre cada dia.
const CURRENT = 3;
const PHASES = [
  { nome: "Choque", dias: [1, 2, 3], tone: "coral" as const, foco: "Desinchar rápido" },
  { nome: "Remove", dias: [4, 5, 6, 7], tone: "sage" as const, foco: "Mapear seu gatilho" },
  { nome: "Reintrodução", dias: [8, 9, 10, 11], tone: "sky" as const, foco: "Testar tolerância" },
  { nome: "Repair", dias: [12, 13, 14], tone: "plum" as const, foco: "Reparar e fechar" },
];

export default function Jornada() {
  return (
    <div className="space-y-6">
      <header className="pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Desafio Desincha
        </p>
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Sua jornada de 14 dias
        </h1>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-ink-soft">
              Dia {CURRENT} de 14
            </span>
            <span className="font-semibold text-sage-deep">
              {Math.round(((CURRENT - 1) / 14) * 100)}%
            </span>
          </div>
          <ProgressBar value={(CURRENT - 1) / 14} />
        </div>
      </header>

      {PHASES.map((phase) => (
        <section key={phase.nome}>
          <div className="mb-2 flex items-center gap-2">
            <Badge tone={phase.tone}>{phase.nome}</Badge>
            <span className="text-sm text-ink-faint">{phase.foco}</span>
          </div>
          <div className="space-y-2">
            {phase.dias.map((d) => {
              const done = d < CURRENT;
              const current = d === CURRENT;
              const locked = d > CURRENT;
              return (
                <div
                  key={d}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 transition-colors",
                    current &&
                      "border-sage/40 bg-surface shadow-[var(--shadow-card)]",
                    done && "border-line bg-surface/60",
                    locked && "border-line/70 bg-cream-deep/40"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
                      done && "bg-sage text-white",
                      current && "bg-coral text-white",
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
                        "font-semibold tracking-tight",
                        locked ? "text-ink-faint" : "text-ink"
                      )}
                    >
                      Dia {d}
                    </p>
                    <p className="truncate text-sm text-ink-soft">
                      {done
                        ? "Concluído"
                        : current
                          ? "Seu dia de hoje · toque para abrir"
                          : "A desbloquear"}
                    </p>
                  </div>
                  {current && (
                    <Sparkles className="size-5 shrink-0 text-coral" />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
