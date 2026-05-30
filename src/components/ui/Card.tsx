import { cn } from "@/lib/cn";

type Elevation = "flat" | "soft" | "card" | "lift";

const elevations: Record<Elevation, string> = {
  flat: "border border-line",
  soft: "shadow-[var(--shadow-soft)]",
  card: "shadow-[var(--shadow-card)]",
  lift: "shadow-[var(--shadow-lift)]",
};

export function Card({
  elevation = "card",
  className,
  children,
  ...props
}: {
  elevation?: Elevation;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5",
        elevations[elevation],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Cabeçalho leve para seções de conteúdo. */
export function CardHeader({
  title,
  caption,
  action,
  className,
}: {
  title: React.ReactNode;
  caption?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {caption && (
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {caption}
          </p>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      {action}
    </div>
  );
}
