import { cn } from "@/lib/cn";

/** Bloco de carregamento — animação suave (shimmer) definida em globals.css. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-cream-deep [animation:var(--animate-shimmer)]",
        className
      )}
    />
  );
}
