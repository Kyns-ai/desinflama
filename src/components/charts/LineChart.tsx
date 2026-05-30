"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { SeriesPoint } from "@/lib/analytics";

const TONES = {
  sage: "#3C9A71",
  coral: "#E66B52",
  sky: "#4f8fad",
  plum: "#8a6597",
  gold: "#c79234",
} as const;

interface LineChartProps {
  data: SeriesPoint[];
  domain: [number, number];
  tone?: keyof typeof TONES;
  height?: number;
  /** Para sintomas onde MENOR é melhor, inverte o gradiente de leitura. */
  className?: string;
}

const W = 320;

export function LineChart({
  data,
  domain,
  tone = "sage",
  height = 120,
  className,
}: LineChartProps) {
  const gid = useId().replace(/:/g, "");
  const color = TONES[tone];
  const H = height;
  const padY = 12;
  const [min, max] = domain;

  if (data.length === 0) return null;

  const n = data.length;
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * (W - 8) + 4);
  const y = (v: number) => {
    const t = (v - min) / (max - min || 1);
    return H - padY - t * (H - padY * 2);
  };

  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const areaPath =
    `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      className={className}
      preserveAspectRatio="none"
      role="img"
    >
      <defs>
        <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* linhas de grade suaves */}
      {[0.5].map((g) => (
        <line
          key={g}
          x1="0"
          x2={W}
          y1={H - padY - g * (H - padY * 2)}
          y2={H - padY - g * (H - padY * 2)}
          stroke="#ECE6DB"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {n > 1 && <path d={areaPath} fill={`url(#area-${gid})`} />}

      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* ponto final destacado */}
      <circle cx={last[0]} cy={last[1]} r="4" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="7" fill={color} fillOpacity="0.18" />
    </svg>
  );
}
