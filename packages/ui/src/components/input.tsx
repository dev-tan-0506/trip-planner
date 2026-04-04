import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string;
  helpText?: string;
  label?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
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
    wrapperClassName,
    ...props
  },
  ref,
) {
  const hintId = id ? `${id}-hint` : undefined;
  const errorId = id ? `${id}-error` : undefined;
  const describedBy = errorText ? errorId : helpText ? hintId : undefined;

  return (
    <label className={cn("flex w-full flex-col gap-[var(--space-sm)]", wrapperClassName)}>
      {label ? (
        <span className="font-[800] uppercase tracking-[0.08em] text-[var(--text-label)] text-[var(--text-muted)]">
          {label}
        </span>
      ) : null}

      <span
        className={cn(
          "flex min-h-[52px] items-center gap-[var(--space-sm)] rounded-[var(--radius-large)] bg-[var(--surface-high)] px-[var(--space-md)] shadow-[var(--shadow-soft)] transition-shadow focus-within:shadow-[var(--shadow-soft-hover)]",
          errorText ? "bg-[rgba(251,81,81,0.18)]" : "",
        )}
      >
        {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
        <input
          aria-describedby={describedBy}
          aria-invalid={errorText ? "true" : "false"}
          className={cn(
            "w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]",
            className,
          )}
          id={id}
          ref={ref}
          type={type}
          {...props}
        />
        {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
      </span>

      {errorText ? (
        <span id={errorId} className="text-sm text-[var(--status-destructive)]">
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
