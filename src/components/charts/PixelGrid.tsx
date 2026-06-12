"use client";

/**
 * Mosaico de dias (padrão "Year in Pixels" do Daylio): 1 célula por dia,
 * colorida pelo desconforto do dia. Mostra de relance quantos dias bons a
 * usuária já teve — progresso sentido sem ler nenhum gráfico.
 */
import { Card } from "@/components/ui";
import { dayDiscomfort, sortedLogs } from "@/lib/analytics";
import { addDays, diffDays } from "@/lib/date";
import type { DailyLog } from "@/types/domain";

// 1 (leve) → 5 (difícil), na paleta da marca — nada de verde/vermelho puros.
const SCALE = ["#4FB286", "#93CBA8", "#E3C878", "#F0A589", "#E66B52"] as const;
const EMPTY = "#F1ECE3";

function colorFor(discomfort: number): string {
  const i = Math.min(4, Math.max(0, Math.round(discomfort) - 1));
  return SCALE[i];
}

export function PixelGrid({ logs }: { logs: DailyLog[] }) {
  const withSymptoms = sortedLogs(logs).filter(
    (l) => Object.keys(l.symptoms).length > 0
  );
  if (withSymptoms.length < 2) return null;

  const byDate = new Map<string, number>();
  for (const l of withSymptoms) byDate.set(l.date, dayDiscomfort(l));

  // janela limitada aos últimos ~13 semanas: um log antigo isolado não pode
  // virar uma parede de células vazias (nem milhares de nós no DOM)
  const last = withSymptoms[withSymptoms.length - 1].date;
  const earliest = withSymptoms[0].date;
  const first =
    diffDays(last, earliest) > 90 ? addDays(last, -90) : earliest;
  const span = diffDays(last, first) + 1;
  const days = Array.from({ length: span }, (_, i) => addDays(first, i));
  const lightDays = withSymptoms.filter(
    (l) => diffDays(l.date, first) >= 0 && dayDiscomfort(l) <= 2.4
  ).length;

  return (
    <Card elevation="card">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-semibold tracking-tight text-ink">
          Seus dias, de relance
        </h2>
        <span className="text-sm font-semibold text-sage-deep">
          {lightDays} {lightDays === 1 ? "dia leve" : "dias leves"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const disc = byDate.get(d);
          return (
            <div
              key={d}
              title={d}
              className="aspect-square rounded-md"
              style={{ backgroundColor: disc != null ? colorFor(disc) : EMPTY }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-ink-faint">
        leve
        {SCALE.map((c) => (
          <span
            key={c}
            className="size-2.5 rounded-[3px]"
            style={{ backgroundColor: c }}
          />
        ))}
        difícil
      </div>
    </Card>
  );
}
