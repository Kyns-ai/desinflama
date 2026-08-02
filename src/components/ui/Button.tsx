"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "rose"
  | "accent"
  | "onColor"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger";
type Size = "sm" | "md" | "lg";

/**
 * `primary` é ROSA (a marca), não terracota.
 *
 * Antes o primário era o acento e, como quase todo CTA usa `primary`, o
 * acento aparecia em todas as telas — o oposto de "acento raro" (Seção 8 do
 * PLANO). Agora: rosa = marca e ação; `accent` (terracota) = o UM destaque
 * por tela. `rose` fica como apelido de `primary` por compatibilidade com as
 * chamadas que já existiam.
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-rose text-white shadow-[var(--shadow-rose)] hover:bg-rose-deep active:bg-rose-deep",
  rose: "bg-rose text-white shadow-[var(--shadow-rose)] hover:bg-rose-deep active:bg-rose-deep",
  accent:
    "bg-coral text-white shadow-[var(--shadow-coral)] hover:bg-coral-deep active:bg-coral-deep",
  /** Botão dentro do campo de cor escuro (home, paywall). */
  onColor:
    "bg-surface text-rose-dark hover:bg-white active:bg-cream-deep shadow-[var(--shadow-card)]",
  secondary:
    "bg-surface text-ink border border-line hover:border-ink-faint/60 active:bg-cream-deep",
  ghost: "bg-transparent text-ink-soft hover:bg-black/[0.04] active:bg-black/[0.06]",
  subtle: "bg-rose-tint text-rose-dark hover:bg-rose-tint/70 active:bg-rose-tint",
  danger: "bg-danger-tint text-danger hover:bg-danger-tint/70 active:bg-danger-tint",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-1.5 rounded-xl",
  md: "h-12 px-5 text-[15px] gap-2 rounded-2xl",
  lg: "h-14 px-6 text-base gap-2 rounded-2xl",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center font-semibold tracking-tight",
    "transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant, size, fullWidth, loading, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
