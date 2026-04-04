import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

type StatusBannerVariant = "success" | "warning" | "destructive";

const variantClasses: Record<StatusBannerVariant, string> = {
  success: "bg-[rgba(0,106,51,0.12)] text-[var(--status-success)]",
  warning: "bg-[rgba(169,48,0,0.12)] text-[var(--accent-primary)]",
  destructive: "bg-[rgba(179,27,37,0.12)] text-[var(--status-destructive)]",
};

export interface StatusBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  variant?: StatusBannerVariant;
}

export function StatusBanner({
  className,
  description,
  icon,
  title,
  variant = "success",
  ...props
}: StatusBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-[var(--space-md)] rounded-[var(--radius-large)] px-[var(--space-lg)] py-[var(--space-md)] shadow-[var(--shadow-soft)]",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon ? <div className="mt-[2px] shrink-0">{icon}</div> : null}
      <div className="flex flex-col gap-[var(--space-xs)]">
        <p className="font-[900] tracking-[-0.02em]">{title}</p>
        {description ? <p className="text-[var(--text-body)] text-current/80">{description}</p> : null}
      </div>
    </div>
  );
}
