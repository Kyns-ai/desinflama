import { cn } from "@/lib/cn";

/**
 * Container das telas com aba inferior. Centraliza no mobile (~390–448px),
 * reserva espaço para a TabBar e respeita as safe areas do iOS.
 */
export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md bg-cream">
      <main className={cn("px-5 pt-safe pb-28", className)}>{children}</main>
    </div>
  );
}
