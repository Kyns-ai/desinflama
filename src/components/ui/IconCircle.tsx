import type { LucideIcon } from "lucide-react";
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

const dims = { sm: "size-9", md: "size-11", lg: "size-14" };
const iconDims = { sm: "size-4.5", md: "size-5", lg: "size-6" };

export function IconCircle({
  icon: Icon,
  tone = "sage",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: keyof typeof dims;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl",
        dims[size],
        tones[tone],
        className
      )}
    >
      <Icon className={iconDims[size]} strokeWidth={2} />
    </span>
  );
}
