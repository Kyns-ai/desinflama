"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "sage" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-[var(--shadow-coral)] hover:bg-coral-deep active:bg-coral-deep",
  sage: "bg-sage text-white shadow-[var(--shadow-sage)] hover:bg-sage-deep active:bg-sage-deep",
  secondary:
    "bg-surface text-ink border border-line hover:border-ink-faint/60 active:bg-cream-deep",
  ghost: "bg-transparent text-ink-soft hover:bg-black/[0.04] active:bg-black/[0.06]",
  subtle: "bg-sage-tint text-sage-dark hover:bg-sage-tint/70 active:bg-sage-tint",
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
