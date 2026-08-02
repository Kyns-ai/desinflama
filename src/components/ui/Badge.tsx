import { cn } from "@/lib/cn";
import { TONE_SOFT, type Tone } from "./tones";

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight",
        TONE_SOFT[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
