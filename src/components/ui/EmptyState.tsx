import type { LucideIcon } from "lucide-react";
import { IconCircle } from "./IconCircle";
import { Art } from "@/components/Art";
import { cn } from "@/lib/cn";
import type { Tone } from "./tones";

/**
 * Estado vazio DESENHADO — ícone/arte + título + o que fazer ali.
 * Container vazio sem isto lê como quebrado (regra do padrão de design).
 */
export function EmptyState({
  icon,
  art,
  title,
  description,
  action,
  tone = "rose",
  className,
}: {
  icon: LucideIcon;
  /** id de ilustração da marca (public/img/{id}.png); cai no ícone se ausente. */
  art?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-8 py-14 text-center",
        className
      )}
    >
      {art ? (
        <Art id={art} className="mb-4 size-24 rounded-3xl" />
      ) : (
        <IconCircle icon={icon} tone={tone} size="lg" className="mb-4" />
      )}
      <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
