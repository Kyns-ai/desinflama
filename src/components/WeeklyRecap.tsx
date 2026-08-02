"use client";

/**
 * Relatório da Semana — card-artefato (padrão Flo). Números com count-up,
 * reveal com spring e botão de salvar como imagem (prova compartilhável,
 * inclusive pra levar à médica/nutri).
 */
import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { Download, Moon, Sparkles, TrendingDown, TrendingUp, Search, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui";
import { humanDayMonth } from "@/lib/date";
import type { WeeklyRecap as Recap } from "@/lib/recap";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = animate(0, to, {
      duration: reduce ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => c.stop();
  }, [to]);
  return (
    <span className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

export function WeeklyRecap({
  recap,
  className,
}: {
  recap: Recap;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  async function salvarImagem() {
    if (!cardRef.current) return;
    setSaving(true);
    setSaveError(false);
    try {
      // import dinâmico: a lib só baixa quando alguém realmente toca em salvar
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#f5ece8",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `desinflama-semana-${recap.week}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (e) {
          // cancelar o share é normal; qualquer outra falha cai no download
          if ((e as DOMException)?.name !== "AbortError") {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = file.name;
            a.click();
          }
        }
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = file.name;
        a.click();
      }
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  const stats: Array<{
    icon: typeof TrendingDown;
    value: React.ReactNode;
    label: string;
  }> = [];

  if (recap.inchacoChangePct != null && recap.inchacoChangePct < 0)
    stats.push({
      icon: TrendingDown,
      value: <CountUp to={Math.abs(recap.inchacoChangePct)} suffix="%" />,
      label: "menos inchaço que no começo da semana",
    });
  if (recap.energiaChangePct != null && recap.energiaChangePct > 0)
    stats.push({
      icon: TrendingUp,
      value: <CountUp to={recap.energiaChangePct} suffix="%" />,
      label: "mais energia",
    });
  if (
    recap.scoreStart != null &&
    recap.scoreEnd != null &&
    recap.scoreEnd > recap.scoreStart
  )
    stats.push({
      icon: Sparkles,
      value: (
        <>
          {recap.scoreStart} → <CountUp to={recap.scoreEnd} />
        </>
      ),
      label: "Índice Intestinal na semana",
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={className}
    >
      <Card elevation="lift" className="overflow-hidden p-0">
        <div ref={cardRef} className="bg-surface p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <Moon className="size-3.5 text-plum" /> Semana {recap.week} ·{" "}
            {humanDayMonth(recap.start)} – {humanDayMonth(recap.end)}
          </p>
          <h3 className="mt-2 font-display text-[1.45rem] font-semibold leading-snug tracking-tight text-ink">
            Sua semana, em números — o que o seu corpo já contou pra gente.
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cream-deep text-ink-soft">
                <UtensilsCrossed className="size-4" />
              </span>
              <p className="text-[15px] text-ink">
                <strong className="font-semibold">
                  <CountUp to={recap.daysLogged} /> de 7 dias
                </strong>{" "}
                <span className="text-ink-soft">registrados</span>
              </p>
            </div>

            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-tint text-rose-deep">
                    <Icon className="size-4" />
                  </span>
                  <p className="text-[15px] text-ink">
                    <strong className="font-semibold">{s.value}</strong>{" "}
                    <span className="text-ink-soft">{s.label}</span>
                  </p>
                </div>
              );
            })}

            {recap.bestDay && (
              <div className="rounded-2xl bg-rose-tint/50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-dark">
                  Seu melhor dia: {humanDayMonth(recap.bestDay.date)}
                </p>
                {recap.bestDay.meals.length > 0 && (
                  <p className="mt-1 text-sm leading-snug text-ink-soft">
                    No prato: {recap.bestDay.meals.join(" · ")}
                  </p>
                )}
              </div>
            )}

            {recap.suspect && (
              <div className="flex items-start gap-3 rounded-2xl bg-coral-tint/50 px-4 py-3">
                <Search className="mt-0.5 size-4 shrink-0 text-coral-dark" />
                <p className="text-sm leading-snug text-ink">
                  <strong className="font-semibold">
                    Suspeito da semana: {recap.suspect.food}.
                  </strong>{" "}
                  <span className="text-ink-soft">
                    Apareceu nas 72h antes de {Math.round(recap.suspect.correlationStrength * 100)}%
                    dos seus dias mais difíceis. O mapa está se formando.
                  </span>
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 text-[11px] text-ink-faint">
            Desinflama · seus dados, seu ritmo
          </p>
        </div>

        <button
          onClick={salvarImagem}
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line py-3 text-sm font-semibold text-rose-deep transition-colors active:bg-rose-tint/40 disabled:opacity-50"
        >
          <Download className="size-4" />
          {saving
            ? "Gerando imagem…"
            : saveError
              ? "Não rolou — tentar de novo"
              : "Salvar como imagem"}
        </button>
      </Card>
    </motion.div>
  );
}
