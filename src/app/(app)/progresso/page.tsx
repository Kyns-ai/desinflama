"use client";

import Link from "next/link";
import { LineChart as LineChartIcon, TrendingDown, TrendingUp, AlertCircle, Trophy, UserCheck, ChevronRight } from "lucide-react";
import { EmptyState, buttonStyles, Card, Badge } from "@/components/ui";
import { isScoreStalled } from "@/lib/score";
import { LineChart } from "@/components/charts/LineChart";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useAppStore } from "@/store/useAppStore";
import {
  scoreSeries,
  symptomSeries,
  bestWorstDays,
  triggerInsights,
  milestones,
  type SeriesPoint,
} from "@/lib/analytics";
import type { SymptomKey } from "@/types/domain";

const SYMPTOM_CARDS: {
  key: SymptomKey;
  label: string;
  emoji: string;
  lowerBetter: boolean;
  tone: "coral" | "sage" | "sky" | "plum";
}[] = [
  { key: "inchaco", label: "Inchaço", emoji: "🎈", lowerBetter: true, tone: "coral" },
  { key: "energia", label: "Energia", emoji: "⚡", lowerBetter: false, tone: "sky" },
  { key: "pele", label: "Pele", emoji: "✨", lowerBetter: false, tone: "plum" },
];

function trend(series: SeriesPoint[], lowerBetter: boolean) {
  if (series.length < 2) return null;
  const firstAvg = avg(series.slice(0, Math.ceil(series.length / 3)));
  const lastAvg = avg(series.slice(-Math.ceil(series.length / 3)));
  const diff = lastAvg - firstAvg;
  if (Math.abs(diff) < 0.3) return { good: true, label: "estável", improving: false };
  const improving = lowerBetter ? diff < 0 : diff > 0;
  return {
    good: improving,
    improving,
    label: improving ? "melhorando" : "de olho",
  };
}
const avg = (xs: SeriesPoint[]) =>
  xs.reduce((a, b) => a + b.value, 0) / (xs.length || 1);

export default function Progresso() {
  const data = useAppStore((s) => s.data);
  const { logs, scores, streak } = data;

  const score = scoreSeries(scores);
  const { best, worst } = bestWorstDays(logs);
  const triggers = triggerInsights(logs);
  const marcos = milestones(logs, streak.longest);
  const hasData = logs.length > 0;
  const stalled = isScoreStalled(scores);

  return (
    <div className="space-y-6">
      <header className="pt-5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Seu progresso
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          A prova de que está funcionando — no seu corpo.
        </p>
      </header>

      {/* Índice Intestinal no tempo */}
      {score.length >= 2 && (
        <Card elevation="card">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-ink">
              Índice Intestinal no tempo
            </h2>
            <span className="font-display text-2xl font-semibold text-sage-deep">
              {score[score.length - 1].value}
            </span>
          </div>
          <LineChart data={score} domain={[0, 100]} tone="sage" />
        </Card>
      )}

      {!hasData && (
        <Card elevation="card" className="px-0">
          <EmptyState
            icon={LineChartIcon}
            title="Seus gráficos aparecem aqui"
            description="Assim que você fizer alguns registros, mostramos seu Índice Intestinal no tempo, a queda do inchaço e seus melhores e piores dias."
            action={
              <Link href="/registrar" className={buttonStyles({ size: "md" })}>
                Fazer meu 1º registro
              </Link>
            }
          />
        </Card>
      )}

      {/* Gráficos por sintoma */}
      {hasData && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            Seus sintomas
          </h2>
          {SYMPTOM_CARDS.map((s) => {
            const series = symptomSeries(logs, s.key);
            if (series.length === 0) return null;
            const t = trend(series, s.lowerBetter);
            return (
              <Card key={s.key} elevation="soft">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold tracking-tight text-ink">
                    <span className="text-lg">{s.emoji}</span> {s.label}
                  </span>
                  {t && (
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        t.good ? "text-sage-deep" : "text-coral-dark"
                      }`}
                    >
                      {s.lowerBetter ? (
                        <TrendingDown className="size-4" />
                      ) : (
                        <TrendingUp className="size-4" />
                      )}
                      {t.label}
                    </span>
                  )}
                </div>
                <LineChart data={series} domain={[1, 5]} tone={s.tone} height={90} />
              </Card>
            );
          })}
        </section>
      )}

      {/* Melhores e piores dias */}
      {best && worst && (
        <section>
          <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
            Seus melhores e piores dias
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <DayCard
              title="Melhor dia"
              tone="sage"
              date={best.log.date}
              meals={best.log.meals.map((m) => m.descricao)}
            />
            <DayCard
              title="Pior dia"
              tone="coral"
              date={worst.log.date}
              meals={worst.log.meals.map((m) => m.descricao)}
            />
          </div>
        </section>
      )}

      {/* Gatilhos correlacionados */}
      {triggers.length > 0 && (
        <Card elevation="card" className="border border-coral/20 bg-coral-tint/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-coral-dark" />
            <h2 className="font-semibold tracking-tight text-ink">
              Um padrão apareceu
            </h2>
          </div>
          <ul className="mt-2 space-y-1.5">
            {triggers.slice(0, 2).map((t) => (
              <li key={t.food} className="text-[15px] text-ink">
                Seus piores dias tiveram{" "}
                <strong className="text-coral-dark">{t.food}</strong> em{" "}
                {Math.round(t.correlationStrength * 100)}% das vezes.
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink-soft">
            Não é proibição — é informação. Teste reduzir e observe.
          </p>
        </Card>
      )}

      {/* Marcos */}
      {marcos.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
            Suas conquistas
          </h2>
          <div className="flex flex-wrap gap-2">
            {marcos.map((m, i) => (
              <Badge key={i} tone="gold" className="px-3 py-1.5 text-sm">
                <Trophy className="size-3.5" /> {m.label}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Upsell de acompanhamento quando o score trava */}
      {stalled && (
        <Link href="/acompanhamento" className="block">
          <Card
            elevation="soft"
            className="flex items-center gap-3.5 border border-gold/30 bg-gold-tint/50 transition-transform active:scale-[0.99]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#9a7322]">
              <UserCheck className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold tracking-tight text-ink">
                Seu padrão pede um olhar de perto
              </h3>
              <p className="text-sm text-ink-soft">
                Veja como funciona o acompanhamento individual
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-ink-faint" />
          </Card>
        </Link>
      )}

      {/* Fotos privadas */}
      <PhotoGallery />
    </div>
  );
}

function DayCard({
  title,
  tone,
  date,
  meals,
}: {
  title: string;
  tone: "sage" | "coral";
  date: string;
  meals: string[];
}) {
  const [, m, d] = date.split("-");
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "sage"
          ? "border-sage/30 bg-sage-tint/40"
          : "border-coral/30 bg-coral-tint/40"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          tone === "sage" ? "text-sage-dark" : "text-coral-dark"
        }`}
      >
        {title}
      </p>
      <p className="mt-0.5 font-display text-lg font-semibold text-ink">
        {d}/{m}
      </p>
      {meals.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {meals.slice(0, 3).map((meal, i) => (
            <li key={i} className="truncate text-sm text-ink-soft">
              {meal}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-faint">Sem refeições anotadas</p>
      )}
    </div>
  );
}
