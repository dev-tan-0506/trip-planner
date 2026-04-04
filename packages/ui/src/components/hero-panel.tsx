import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Button, type ButtonProps } from "../button";
import { cn } from "../lib/utils";
import { Badge } from "./badge";

export interface HeroPanelAction {
  label: string;
  leadingIcon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  trailingIcon?: ReactNode;
  variant?: ButtonProps["variant"];
}

export interface HeroPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  actions?: HeroPanelAction[];
  badgeLabel?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  media?: ReactNode;
  title: ReactNode;
}

export function HeroPanel({
  actions,
  badgeLabel,
  children,
  className,
  description,
  eyebrow,
  media,
  title,
  ...props
}: HeroPanelProps) {
  return (
    <section
      className={cn(
        "surface-glass grid gap-[var(--space-lg)] overflow-hidden rounded-[var(--radius-hero)] p-[var(--space-xl)] shadow-[var(--shadow-soft-lg)] lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-[var(--space-md)]">
        <div className="flex flex-wrap items-center gap-[var(--space-sm)]">
          {eyebrow ? <span className="text-[13px] font-[800] uppercase tracking-[0.16em] text-[var(--text-muted)]">{eyebrow}</span> : null}
          {badgeLabel ? <Badge variant="discovery">{badgeLabel}</Badge> : null}
        </div>

        <div className="flex flex-col gap-[var(--space-sm)]">
          <h2 className="text-[clamp(2.4rem,4vw,4.5rem)] font-[900] leading-[0.95] tracking-[-0.04em] text-[var(--text-heading)]">
            {title}
          </h2>
          {description ? (
            <p className="max-w-[42rem] text-[var(--text-body-lg)] text-[var(--text-muted)]">{description}</p>
          ) : null}
        </div>

        {actions?.length ? (
          <div className="flex flex-wrap gap-[var(--space-sm)]">
            {actions.map((action) => (
              <Button
                key={action.label}
                leadingIcon={action.leadingIcon}
                onClick={action.onClick}
                size="lg"
                trailingIcon={action.trailingIcon}
                variant={action.variant ?? "primary"}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {children ? <div className="flex flex-col gap-[var(--space-sm)]">{children}</div> : null}
      </div>

      {media ? (
        <div className="relative overflow-hidden rounded-[calc(var(--radius-hero)-0.5rem)] bg-[linear-gradient(135deg,rgba(169,48,0,0.14),rgba(90,59,221,0.14),rgba(0,106,51,0.12))] p-[var(--space-md)]">
          {media}
        </div>
      ) : null}
    </section>
  );
}
