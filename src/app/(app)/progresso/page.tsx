"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Flame,
  Sprout,
  Trophy,
} from "lucide-react";
import { EmptyState, buttonStyles, Card, Badge, ScoreRing } from "@/components/ui";
import { LineChart } from "@/components/charts/LineChart";
import { PixelGrid } from "@/components/charts/PixelGrid";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { latestRecap } from "@/lib/recap";
import { PhotoGallery } from "@/components/PhotoGallery";
import { CardsParaPostar } from "@/components/compartilhar/CardsParaPostar";
import { estadoBroto } from "@/lib/broto";
import { currentScore, scoreMicrocopy } from "@/lib/score";
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
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";

const SYMPTOM_CARDS: {
  key: SymptomKey;
  label: string;
  emoji: string;
  lowerBetter: boolean;
  tone: "coral" | "rose" | "sky" | "plum";
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
  const { logs, scores, streak, progress } = data;
  const startedAt = progress?.startedAt ?? null;
  const recap = useMemo(
    () => (startedAt ? latestRecap(logs, scores, startedAt) : null),
    [logs, scores, startedAt]
  );

  const score = scoreSeries(scores);
  const { best, worst } = bestWorstDays(logs);
  const triggers = triggerInsights(logs);
  const marcos = milestones(logs, streak.longest);
  const hasData = logs.length > 0;
  const indice = currentScore(data);
  const broto = estadoBroto(data.seedsLifetime, 0, false);

  return (
    <div className="pb-4">
      {/* CAMPO DE COR com o Índice.
          O anel saiu da Hoje (lá o espaço é do Broto e do cartão do dia) e
          veio para cá, que é a aba "Eu". Aqui ele é o motivo da visita, então
          ganha o topo inteiro em vez de dividir uma fileira de três
          quadradinhos com a ofensiva e o nível. */}
      <div className="-mx-5 -mt-safe bg-rose-dark px-5 pt-safe">
        <div className="pb-10 pt-4">
          <p className="text-label font-semibold uppercase tracking-[0.06em] text-white/55">
            Eu
          </p>
          <h1 className="mt-1 font-display text-h1 font-semibold text-white">
            Seu progresso
          </h1>

          <div className="mt-6 flex flex-col items-center">
            <ScoreRing
              value={indice.value}
              from={Math.max(0, indice.value - indice.delta)}
              delta={indice.delta}
              size={186}
              label="Índice Intestinal"
              tone="onColor"
            />
            <p className="mt-4 max-w-[17rem] text-center text-[15px] leading-relaxed text-white/75">
              {scoreMicrocopy(indice.value, indice.delta)}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/15 pt-4 text-center">
            <div>
              <p className="numeral inline-flex items-center gap-1.5 font-display text-xl text-white">
                <Flame className="size-4" />
                {streak.current}
              </p>
              <p className="text-xs text-white/55">dias seguidos</p>
            </div>
            <div>
              <p className="numeral inline-flex items-center gap-1.5 font-display text-xl text-white">
                <Sprout className="size-4" />
                {data.seeds}
              </p>
              <p className="text-xs text-white/55">sementes</p>
            </div>
            <div>
              <p className="font-display text-xl text-white">
                {broto.nivel.nome}
              </p>
              <p className="text-xs text-white/55">seu broto</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mx-5 -mt-4 space-y-5 rounded-t-[2rem] bg-cream px-5 pt-6">
      {/* Os cards de conquista vêm ANTES dos gráficos: gráfico é pra ela
          entender, card é pra ela mostrar — e mostrar é o que traz gente nova. */}
      <CardsParaPostar />

      {/* Mosaico de dias — quantos dias bons você já teve, de relance */}
      {hasData && <PixelGrid logs={logs} />}

      {/* Relatório da última semana fechada */}
      {recap && <WeeklyRecap recap={recap} />}

      {/* Índice Intestinal no tempo */}
      {score.length >= 2 && (
        <Card elevation="card">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-ink">
              Índice Intestinal no tempo
            </h2>
            <span className="font-display text-2xl font-semibold text-rose-deep">
              {score[score.length - 1].value}
            </span>
          </div>
          <LineChart data={score} domain={[0, 100]} tone="rose" />
        </Card>
      )}

      {!hasData && (
        <Card elevation="card" className="px-0">
          <EmptyState
            icon={LineChartIcon}
            art="empty-grafico"
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
                    <Art
                      id={artId(s.emoji) ?? ""}
                      emoji={s.emoji}
                      className="size-6 rounded-md text-lg"
                    />{" "}
                    {s.label}
                  </span>
                  {t && (
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        t.good ? "text-rose-deep" : "text-coral-dark"
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
              tone="rose"
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
                Seus piores dias vieram depois de{" "}
                <strong className="text-coral-dark">{t.food}</strong> em{" "}
                {Math.round(t.correlationStrength * 100)}% das vezes.
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink-soft">
            A reação pode atrasar até uns 3 dias — por isso olhamos o que você
            comeu nas 72h antes. Não é proibição, é informação: teste reduzir e
            observe.
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

      {/* Fotos privadas */}
      <PhotoGallery />
      </div>
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
  tone: "rose" | "coral";
  date: string;
  meals: string[];
}) {
  const [, m, d] = date.split("-");
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "rose"
          ? "border-rose/30 bg-rose-tint/40"
          : "border-coral/30 bg-coral-tint/40"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          tone === "rose" ? "text-rose-dark" : "text-coral-dark"
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
