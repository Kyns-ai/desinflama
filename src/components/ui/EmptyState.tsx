import type { LucideIcon } from "lucide-react";
import { IconCircle } from "./IconCircle";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "sage",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "sage" | "coral" | "gold" | "sky" | "plum" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-8 py-14 text-center",
        className
      )}
    >
      <IconCircle icon={icon} tone={tone} size="lg" className="mb-4" />
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
