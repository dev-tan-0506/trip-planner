import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-[var(--radius-base)] bg-[var(--surface-high)]", className)}
      {...props}
    />
  );
}
