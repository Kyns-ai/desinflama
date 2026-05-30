import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-5", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

const tones = {
  sage: "bg-sage-tint text-sage-dark",
  coral: "bg-coral-tint text-coral-dark",
  gold: "bg-gold-tint text-[#9a7322]",
  sky: "bg-sky-tint text-[#3d6f88]",
  plum: "bg-plum-tint text-[#6c4d78]",
  neutral: "bg-canvas text-ink-soft",
  danger: "bg-danger-tint text-danger",
};
export type Tone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-9 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-[18px]" />
        </span>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              up ? "text-sage-deep" : "text-coral-dark"
            )}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(Math.round((delta ?? 0) * 100))}%
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-[1.7rem] font-semibold leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{label}</p>
      </div>
    </Card>
  );
}

export function SourceBadge({ source }: { source: "mock" | "supabase" }) {
  return source === "supabase" ? (
    <Badge tone="sage">● Supabase</Badge>
  ) : (
    <Badge tone="gold">● Dados de demonstração</Badge>
  );
}
