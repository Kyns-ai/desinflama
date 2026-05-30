import type { SeriesPoint } from "@/lib/types";

/* Gráficos SVG leves (sem dependências). */

export function LineChart({
  data,
  height = 180,
  color = "#3C9A71",
  fmt = (v: number) => String(v),
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  fmt?: (v: number) => string;
}) {
  const W = 640;
  const H = height;
  const pad = 28;
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const min = Math.min(...data.map((d) => d.value), 0);
  const x = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const line = data.map((d, i) => `${i ? "L" : "M"} ${x(i)} ${y(d.value)}`).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${H - pad} L ${x(0)} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="#F2EDE4" />
      ))}
      <path d={area} fill="url(#lc)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) =>
        i % Math.ceil(data.length / 7) === 0 || i === data.length - 1 ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-[#9a958c]" fontSize="11">
            {d.label}
          </text>
        ) : null
      )}
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].value)} r="4" fill={color} />
      <text x={x(data.length - 1)} y={y(data[data.length - 1].value) - 10} textAnchor="end" fontSize="12" className="fill-[#232220]" fontWeight="600">
        {fmt(data[data.length - 1].value)}
      </text>
    </svg>
  );
}

export function BarChart({
  data,
  height = 200,
  color = "#3C9A71",
  fmt = (v: number) => String(v),
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  fmt?: (v: number) => string;
}) {
  const W = 640;
  const H = height;
  const pad = 28;
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const h = ((d.value) / (max || 1)) * (H - pad * 2);
        const x = pad + i * bw + bw * 0.18;
        const w = bw * 0.64;
        return (
          <g key={i}>
            <rect x={x} y={H - pad - h} width={w} height={h} rx="5" fill={color} opacity={0.9} />
            <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="11" className="fill-[#9a958c]">
              {d.label}
            </text>
          </g>
        );
      })}
      <text x={W - pad} y={16} textAnchor="end" fontSize="12" className="fill-[#232220]" fontWeight="600">
        último: {fmt(data[data.length - 1].value)}
      </text>
    </svg>
  );
}

export function Donut({
  data,
  size = 160,
}: {
  data: { plan: string; count: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d, i) => {
          const frac = d.count / total;
          const dash = frac * c;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.plan} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-ink-soft">{d.plan}</span>
            <span className="font-semibold text-ink">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
