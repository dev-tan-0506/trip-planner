import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string;
  helpText?: string;
  label?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: "default" | "auth";
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    errorText,
    helpText,
    id,
    label,
    leadingIcon,
    trailingIcon,
    type = "text",
    variant = "default",
    wrapperClassName,
    ...props
  },
  ref,
) {
  const hintId = id ? `${id}-hint` : undefined;
  const errorId = id ? `${id}-error` : undefined;
  const describedBy = errorText ? errorId : helpText ? hintId : undefined;
  const isAuth = variant === "auth";

  return (
    <label className={cn("flex w-full flex-col gap-[var(--space-sm)]", wrapperClassName)}>
      {label ? (
        <span
          className={cn(
            "text-sm font-[900] tracking-[-0.01em] text-[var(--text-primary)]",
            isAuth ? "text-[11px] font-[800] uppercase tracking-[0.09em] text-neutral-500" : "",
          )}
        >
          {label}
        </span>
      ) : null}

      <span
        className={cn(
          "group flex min-h-[60px] items-center gap-[var(--space-sm)] rounded-[1.4rem] border border-[rgba(47,46,46,0.1)] bg-white px-[var(--space-md)] shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all focus-within:border-[rgba(169,48,0,0.3)] focus-within:shadow-[0_12px_28px_rgba(169,48,0,0.12)]",
          isAuth
            ? "min-h-[56px] gap-3 rounded-[1.25rem] border border-neutral-200 bg-white px-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-200 focus-within:border-[var(--accent-primary)] focus-within:shadow-[0_4px_20px_rgba(169,48,0,0.13)] focus-within:ring-2 focus-within:ring-[rgba(169,48,0,0.08)]"
            : "",
          errorText
            ? isAuth
              ? "border-[rgba(179,27,37,0.3)] bg-[rgba(251,81,81,0.04)] focus-within:border-[rgba(179,27,37,0.4)] focus-within:shadow-[0_4px_20px_rgba(179,27,37,0.1)] focus-within:ring-[rgba(179,27,37,0.08)]"
              : "border-[rgba(179,27,37,0.22)] bg-[rgba(251,81,81,0.06)]"
            : "",
        )}
      >
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className={cn(
              "text-[var(--text-muted)]",
              isAuth
                ? cn(
                    "shrink-0 transition-colors duration-200",
                    errorText ? "text-[var(--status-destructive)]" : "text-neutral-400 group-focus-within:text-[var(--accent-primary)]",
                  )
                : "",
            )}
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          aria-describedby={describedBy}
          aria-invalid={errorText ? "true" : "false"}
          className={cn(
            "w-full bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[rgba(47,46,46,0.46)]",
            isAuth ? "text-[15px] font-[600] text-neutral-900 placeholder:text-neutral-400" : "",
            className,
          )}
          id={id}
          ref={ref}
          type={type}
          {...props}
        />
        {trailingIcon ? (
          <span
            aria-hidden="true"
            className={cn(
              "text-[var(--text-muted)]",
              isAuth ? "shrink-0 text-neutral-400 transition-colors duration-200 group-focus-within:text-[var(--accent-primary)]" : "",
            )}
          >
            {trailingIcon}
          </span>
        ) : null}
      </span>

      {errorText ? (
        <span id={errorId} className={cn("font-[700] text-[var(--status-destructive)]", isAuth ? "text-[12px]" : "text-sm")}>
          {errorText}
        </span>
      ) : helpText ? (
        <span id={hintId} className="text-sm text-[var(--text-muted)]">
          {helpText}
        </span>
      ) : null}
    </label>
  );
});
