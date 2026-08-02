"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#A8446A", "#A8446A", "#A97F2E", "#47758A", "#6F5A6A"];

// pseudo-aleatório determinístico (puro) — evita Math.random durante o render
function rand(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Explosão leve de confete para celebrações (microvitórias). */
export function Confetti({ count = 28 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (rand(i + 1) - 0.5) * 360,
        fall: 280 + rand(i + 2) * 260,
        rot: (rand(i + 3) - 0.5) * 540,
        delay: rand(i + 4) * 0.18,
        dur: 1.1 + rand(i + 5) * 0.7,
        size: 6 + rand(i + 6) * 7,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/3"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "999px" : "2px",
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.fall, opacity: 0, rotate: p.rot }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
