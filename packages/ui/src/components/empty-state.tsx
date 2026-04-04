import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
  body?: string;
  icon?: ReactNode;
  title?: string;
}

export function EmptyState({
  action,
  body = "Tạo một mục mới hoặc chọn gợi ý có sẵn để bắt đầu nhanh.",
  className,
  icon,
  title = "Chưa có gì để quẩy hết",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-[var(--space-md)] rounded-[var(--radius-large)] bg-[var(--surface-section)] p-[var(--space-xl)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      {icon ? <div className="text-[var(--text-heading)]">{icon}</div> : null}
      <div className="flex flex-col gap-[var(--space-sm)]">
        <h3 className="text-[var(--text-heading)]">{title}</h3>
        <p className="text-[var(--text-muted)]">{body}</p>
      </div>
      {action}
    </div>
  );
}
