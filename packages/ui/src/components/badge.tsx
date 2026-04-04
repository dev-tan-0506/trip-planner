import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

type BadgeVariant = "neutral" | "status" | "counter" | "discovery" | "success" | "destructive";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--surface-section)] text-[var(--text-primary)]",
  status: "bg-[var(--surface-high)] text-[var(--text-primary)]",
  counter: "bg-[var(--accent-primary)] text-white",
  discovery: "bg-[rgba(90,59,221,0.14)] text-[var(--status-discovery)]",
  success: "bg-[rgba(0,106,51,0.12)] text-[var(--status-success)]",
  destructive: "bg-[rgba(179,27,37,0.12)] text-[var(--status-destructive)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--space-xs)] rounded-[var(--radius-pill)] px-[var(--space-sm)] py-[6px] text-[13px] font-[800] tracking-[0.04em]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
