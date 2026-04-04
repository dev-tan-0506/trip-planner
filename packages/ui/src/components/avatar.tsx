import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

type AvatarStatus = "online" | "busy" | "offline";

const statusClasses: Record<AvatarStatus, string> = {
  online: "bg-[var(--status-success)]",
  busy: "bg-[var(--status-destructive)]",
  offline: "bg-[var(--surface-outline)]",
};

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: "sm" | "md" | "lg";
  src?: string;
  status?: AvatarStatus;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({
  className,
  initials,
  size = "md",
  src,
  status,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-section)] font-[800] text-[var(--text-primary)] shadow-[var(--shadow-soft)]",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? <img alt={initials} className="h-full w-full object-cover" src={src} /> : initials}
      {status ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface-app)]",
            statusClasses[status],
          )}
        />
      ) : null}
    </div>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AvatarGroup({ children, className, ...props }: AvatarGroupProps) {
  return (
    <div className={cn("flex items-center [&>*:not(:first-child)]:-ml-3", className)} {...props}>
      {children}
    </div>
  );
}
