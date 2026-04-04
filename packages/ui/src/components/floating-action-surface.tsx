import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Button, type ButtonProps } from "../button";
import { cn } from "../lib/utils";

export interface FloatingActionSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  actionLabel: string;
  description?: ReactNode;
  icon?: ReactNode;
  onActionClick?: MouseEventHandler<HTMLButtonElement>;
  secondarySlot?: ReactNode;
  variant?: ButtonProps["variant"];
}

export function FloatingActionSurface({
  actionLabel,
  className,
  description,
  icon,
  onActionClick,
  secondarySlot,
  variant = "primary",
  ...props
}: FloatingActionSurfaceProps) {
  return (
    <div
      className={cn(
        "surface-glass flex min-h-[80px] w-full items-center justify-between gap-[var(--space-md)] rounded-[var(--radius-hero)] p-[var(--space-md)] shadow-[0_24px_64px_rgba(35,28,24,0.12)]",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-xs)]">
        <span className="text-[13px] font-[800] uppercase tracking-[0.16em] text-[var(--text-muted)]">Quick action surface</span>
        {description ? <p className="truncate text-[var(--text-body)] text-[var(--text-muted)]">{description}</p> : null}
      </div>

      <div className="flex shrink-0 items-center gap-[var(--space-sm)]">
        {secondarySlot}
        <Button
          className="min-h-[56px] min-w-[80px] shadow-[0_18px_48px_rgba(35,28,24,0.12)]"
          leadingIcon={icon}
          onClick={onActionClick}
          size="lg"
          variant={variant}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
