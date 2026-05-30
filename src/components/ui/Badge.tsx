import { cn } from "@/lib/cn";

type Tone = "sage" | "coral" | "gold" | "sky" | "plum" | "neutral";

const tones: Record<Tone, string> = {
  sage: "bg-sage-tint text-sage-dark",
  coral: "bg-coral-tint text-coral-dark",
  gold: "bg-gold-tint text-[#9a7322]",
  sky: "bg-sky-tint text-[#3d6f88]",
  plum: "bg-plum-tint text-[#6c4d78]",
  neutral: "bg-cream-deep text-ink-soft",
};

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
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
