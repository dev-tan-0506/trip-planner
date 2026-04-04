import type { HTMLAttributes, ReactNode } from "react";
import { Card } from "../card";
import { cn } from "../lib/utils";

type SectionFrameSurface = "base" | "lifted" | "glass";

export interface SectionFrameProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  actionSlot?: ReactNode;
  description?: ReactNode;
  surface?: SectionFrameSurface;
  title: ReactNode;
}

export function SectionFrame({
  actionSlot,
  children,
  className,
  description,
  surface = "base",
  title,
  ...props
}: SectionFrameProps) {
  return (
    <section className={cn("flex flex-col gap-[var(--space-md)]", className)} {...props}>
      <div className="flex flex-col gap-[var(--space-sm)] md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-[var(--space-xs)]">
          <h3 className="text-[1.75rem] font-[900] tracking-[-0.03em] text-[var(--text-heading)]">{title}</h3>
          {description ? <p className="text-[var(--text-body)] text-[var(--text-muted)]">{description}</p> : null}
        </div>
        {actionSlot ? <div className="shrink-0">{actionSlot}</div> : null}
      </div>

      <Card className="flex flex-col gap-[var(--space-md)] rounded-[var(--radius-hero)]" variant={surface}>
        {children}
      </Card>
    </section>
  );
}
