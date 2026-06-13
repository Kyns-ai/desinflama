"use client";

/**
 * Linha do tempo pessoal na home — a versão honesta e recorrente do "gráfico de
 * previsão" dos apps de sucesso (Noom revisita o gráfico o tempo todo). Mostra os
 * marcos do programa nas DATAS reais da pessoa e onde ela está agora. Não promete
 * resultado de peso; ancora a expectativa no calendário dela pra dar tangibilidade.
 */
import { Check } from "lucide-react";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { projectionTimeline } from "@/lib/projection";
import { PROJECTION_NOTE } from "@/content/promise";
import { cn } from "@/lib/cn";

export function ProjectionTimeline() {
  const startedAt = useAppStore((s) => s.data.progress?.startedAt);
  if (!startedAt) return null;

  const pts = projectionTimeline(startedAt);
  // some quando todos os marcos já passaram — a essa altura o valor é o histórico
  // real (Relatório/Mapa), não a previsão
  if (pts.every((p) => p.reached)) return null;

  return (
    <Card elevation="soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        O que esperar — no seu ritmo
      </p>

      <div className="mt-4 flex items-start justify-between">
        {pts.map((p, i) => (
          <div key={p.when} className="relative flex flex-1 flex-col items-center text-center">
            {/* linha conectora */}
            {i < pts.length - 1 && (
              <span
                className={cn(
                  "absolute left-1/2 top-3 h-0.5 w-full",
                  p.reached ? "bg-sage" : "bg-line"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-6 place-items-center rounded-full border-2 transition-colors",
                p.reached
                  ? "border-sage bg-sage text-white"
                  : p.isNext
                    ? "border-sage bg-cream"
                    : "border-line bg-cream"
              )}
            >
              {p.reached ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : (
                <span className={cn("size-2 rounded-full", p.isNext ? "bg-sage" : "bg-line")} />
              )}
            </span>
            <span className="mt-2 font-display text-sm font-semibold text-ink">{p.when}</span>
            <span className={cn("text-[11px] font-semibold", p.isNext ? "text-sage-deep" : "text-ink-faint")}>
              {p.isNext ? `${p.dateLabel} · próximo` : p.dateLabel}
            </span>
            <span className="mt-0.5 text-[11px] leading-tight text-ink-soft">{p.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">{PROJECTION_NOTE}</p>
    </Card>
  );
}
