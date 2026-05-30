"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  className?: string;
  tone?: "sage" | "coral" | "gold";
  /** segmentos: usado na barra de fases do onboarding/jornada */
  segments?: number;
  active?: number;
  height?: number;
}

const tones = {
  sage: "bg-sage",
  coral: "bg-coral",
  gold: "bg-gold",
};

export function ProgressBar({
  value,
  className,
  tone = "sage",
  segments,
  active = 0,
  height = 8,
}: ProgressBarProps) {
  if (segments) {
    return (
      <div className={cn("flex gap-1.5", className)}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 overflow-hidden rounded-full bg-cream-deep"
            style={{ height }}
          >
            <motion.div
              className={cn("h-full rounded-full", tones[tone])}
              initial={{ width: 0 }}
              animate={{ width: i < active ? "100%" : i === active ? "100%" : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden rounded-full bg-cream-deep", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", tones[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
