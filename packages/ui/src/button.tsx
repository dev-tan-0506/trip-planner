import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--gradient-cta)] text-white shadow-[var(--shadow-soft)] hover:scale-[1.02] hover:shadow-[var(--shadow-soft-hover)]",
  secondary:
    "bg-[var(--surface-section)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] hover:scale-[1.02]",
  ghost:
    "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-section)]",
  destructive:
    "bg-[var(--status-destructive)] text-white shadow-[var(--shadow-soft)] hover:scale-[1.02]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[44px] px-[var(--space-md)] text-[13px]",
  md: "min-h-[48px] px-[var(--space-lg)] text-[var(--text-body)]",
  lg: "min-h-[56px] px-[var(--space-xl)] text-[var(--text-body)]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  children,
  className,
  disabled,
  leadingIcon,
  loading = false,
  size = "md",
  trailingIcon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-[var(--space-sm)] rounded-[var(--radius-pill)] font-[800] tracking-[-0.01em] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-emphasis)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      data-loading={loading ? "true" : "false"}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? <span aria-hidden="true">...</span> : leadingIcon}
      <span>{children}</span>
      {!loading ? trailingIcon : null}
    </button>
  );
}
