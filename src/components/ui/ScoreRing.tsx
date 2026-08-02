"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface ScoreRingProps {
  /** 0–100 */
  value: number;
  /** valor anterior, para animar a partir dele e mostrar o delta */
  from?: number;
  delta?: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
  /**
   * "cream" = anel sobre fundo claro (padrão).
   * "onColor" = anel sobre o campo de cor da home: trilha translúcida, arco e
   * número em branco. Sem isso o grafite sobre verde some.
   */
  tone?: "cream" | "onColor";
}

/**
 * Índice Intestinal — anel animado. O número conta de `from` até `value` e o arco
 * preenche junto. É a peça-assinatura do app (ver dashboard).
 */
export function ScoreRing({
  value,
  from,
  delta,
  size = 220,
  stroke = 16,
  label = "Índice Intestinal",
  className,
  tone = "cream",
}: ScoreRingProps) {
  const onColor = tone === "onColor";
  const start = from ?? value;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const progress = useMotionValue(start / 100);
  const offset = useTransform(progress, (p) => c * (1 - p));
  const [display, setDisplay] = useState(Math.round(start));

  const reduce = useRef(false);
  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const controls = animate(progress, value / 100, {
      duration: reduce.current ? 0 : 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    const num = animate(start, value, {
      duration: reduce.current ? 0 : 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => {
      controls.stop();
      num.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          {/* Um rosa só, do claro ao escuro da própria marca — não é
              gradiente decorativo, é volume no arco. */}
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B85179" />
            <stop offset="100%" stopColor="#6A2440" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={onColor ? "rgba(255,255,255,0.22)" : "var(--color-cream-deep)"}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={onColor ? "#ffffff" : "url(#score-grad)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center">
        {/* Preso ao diâmetro interno: sem isso o rótulo encosta no arco. */}
        <div style={{ maxWidth: size - stroke * 2 - 12 }}>
          <div
            className={cn(
              "font-display font-semibold leading-none tabular-nums",
              onColor ? "text-[4rem] text-white" : "text-[3.4rem] text-ink"
            )}
          >
            {display}
          </div>
          <div
            className={cn(
              "mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide",
              onColor ? "text-white/70" : "text-ink-faint"
            )}
          >
            {label}
          </div>
          {typeof delta === "number" && delta !== 0 && (
            <div
              className={cn(
                "mx-auto mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                delta > 0
                  ? "bg-rose-tint text-rose-dark"
                  : "bg-coral-tint text-coral-dark"
              )}
            >
              {delta > 0 ? (
                <ArrowUp className="size-3.5" strokeWidth={2.6} />
              ) : (
                <ArrowDown className="size-3.5" strokeWidth={2.6} />
              )}
              {Math.abs(delta)} pts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
