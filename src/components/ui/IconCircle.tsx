import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { TONE_SOFT, TONE_SOLID, type Tone } from "./tones";

const dims = { sm: "size-9", md: "size-11", lg: "size-14" };
const iconDims = { sm: "size-4.5", md: "size-5", lg: "size-6" };

export function IconCircle({
  icon: Icon,
  tone = "rose",
  size = "md",
  /** Cor em força total — reservado ao estado "feito". */
  solid = false,
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: keyof typeof dims;
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl",
        dims[size],
        solid ? TONE_SOLID[tone] : TONE_SOFT[tone],
        className
      )}
    >
      <Icon className={iconDims[size]} strokeWidth={2} />
    </span>
  );
}
