import { cn } from "@/lib/cn";

/** Cabeçalho de tela consistente entre as abas. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-end justify-between gap-3 pt-5", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}
