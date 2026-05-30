import { cn } from "@/lib/cn";

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)}>
      <h2 className="text-base font-semibold tracking-tight text-ink">
        {children}
      </h2>
      {action}
    </div>
  );
}
