import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

type IconButtonShape = "circle" | "rounded-2xl";
type IconButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<IconButtonVariant, string> = {
  primary: "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-soft)]",
  secondary: "bg-[var(--surface-section)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]",
  ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-section)]",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  shape?: IconButtonShape;
  variant?: IconButtonVariant;
}

export function IconButton({
  className,
  disabled,
  icon,
  shape = "circle",
  type = "button",
  variant = "ghost",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform duration-[var(--motion-fast)] ease-[var(--ease-emphasis)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        shape === "circle" ? "rounded-full" : "rounded-[var(--radius-large)]",
        variantClasses[variant],
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {icon}
    </button>
  );
}
