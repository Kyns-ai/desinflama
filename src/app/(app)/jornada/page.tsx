"use client";

import Link from "next/link";
import { Lock, Check, Trophy, ChevronRight, BookOpen } from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui";
import { Art } from "@/components/Art";
import { useAppStore } from "@/store/useAppStore";
import { phasesFor, totalDays } from "@/lib/journey";
import { dayCover } from "@/content/journey";
import { artId } from "@/content/cardArt";
import { cn } from "@/lib/cn";

/**
 * A trilha. Regra desta tela: um dia bloqueado mostra o MESMO nome que um dia
 * aberto — só o acesso muda. Quem pagou precisa ver o que comprou; fileira de
 * cadeados anônimos ("A desbloquear") esconde justamente o produto.
 */

/** Miniatura do dia: ilustração da marca, com o ícone de aula como fallback. */
function DayArt({
  artKey,
  muted,
  className,
}: {
  artKey: string;
  muted: boolean;
  className?: string;
}) {
  const id = artId(artKey);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white",
        // Bloqueado fica discreto, mas nunca apagado a ponto de virar caixa vazia.
        muted && "opacity-[0.72] saturate-[0.7]",
        className
      )}
    >
      {id ? (
        <Art id={id} emoji="" className="size-full" />
      ) : (
        <BookOpen className="size-5 text-ink-faint" />
      )}
    </span>
  );
}

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

  return (
    <div className="space-y-7">
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
            <span className="font-semibold text-sage-deep">
              {Math.round((completed.length / totalLabel) * 100)}%
            </span>
          </div>
          <ProgressBar value={completed.length / totalLabel} />
        </div>
      </header>

      {phases.map((phase) => (
        <section key={phase.phase}>
          <div className="mb-3 flex items-center gap-2">
            <Badge tone={phase.tone}>{phase.phase}</Badge>
            <span className="text-sm text-ink-faint">{phase.focus}</span>
            <span className="ml-auto text-xs text-ink-faint">
              Dias {phase.start}–{phase.end}
            </span>
          </div>
          <div className="space-y-2">
            {Array.from(
              { length: phase.end - phase.start + 1 },
              (_, i) => phase.start + i
            ).map((d) => {
              const done = completed.includes(d);
              const isCurrent = d === current && !done;
              const locked = d > current;
              const cover = dayCover(d);

              const inner = (
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all",
                    isCurrent &&
                      "border-sage/50 bg-surface shadow-[var(--shadow-card)]",
                    done && "border-line bg-surface/70",
                    locked && "border-line/70 bg-cream-deep/30",
                    !locked && "active:scale-[0.99]"
                  )}
                >
                  <div className="flex items-center gap-3 p-3">
                    <DayArt
                      artKey={cover.artKey}
                      muted={locked}
                      className={isCurrent ? "size-16" : "size-12"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs font-semibold uppercase tracking-wide",
                            locked ? "text-ink-faint" : "text-sage-deep"
                          )}
                        >
                          Dia {d}
                        </span>
                        {cover.milestone && (
                          <Trophy className="size-3.5 text-gold" />
                        )}
                        {done && (
                          <Check
                            className="size-3.5 text-sage-deep"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <p
                        className={cn(
                          "line-clamp-2 leading-snug tracking-tight",
                          isCurrent
                            ? "font-display text-[17px] text-ink"
                            : "text-[15px] font-medium",
                          locked ? "text-ink-faint" : "text-ink"
                        )}
                      >
                        {cover.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {done
                          ? "Concluído"
                          : `Aula de ${cover.durationMin} min + checklist`}
                      </p>
                    </div>
                    {locked ? (
                      <Lock className="size-4 shrink-0 text-ink-faint" />
                    ) : (
                      !isCurrent && (
                        <ChevronRight className="size-4 shrink-0 text-ink-faint" />
                      )
                    )}
                  </div>
                  {isCurrent && (
                    <p className="flex items-center justify-center gap-1.5 border-t border-line-soft bg-cream/60 py-2.5 text-sm font-semibold text-coral-deep">
                      Continuar o Dia {d}
                      <ChevronRight className="size-4" />
                    </p>
                  )}
                </div>
              );

              return locked ? (
                <div key={d}>{inner}</div>
              ) : (
                <Link key={d} href={`/jornada/${d}`} className="block">
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
