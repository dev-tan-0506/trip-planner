import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
  detail?: string;
  title?: string;
}

export function ErrorState({
  action,
  className,
  detail = "Có lỗi xảy ra rồi. Thử lại một lần nữa hoặc tải lại trang nếu vẫn chưa ổn.",
  title = "Có lỗi xảy ra rồi",
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-[var(--space-md)] rounded-[var(--radius-large)] bg-[rgba(251,81,81,0.16)] p-[var(--space-xl)] text-[var(--status-destructive)] shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      <h3 className="text-[var(--text-heading)] text-[var(--status-destructive)]">{title}</h3>
      <p className="text-[var(--status-destructive)]">{detail}</p>
      {action}
    </div>
  );
}
