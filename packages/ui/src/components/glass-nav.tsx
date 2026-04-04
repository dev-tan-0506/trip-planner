import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "../button";

export interface GlassNavItem {
  icon?: ReactNode;
  id: string;
  label: string;
}

export interface GlassNavProps extends HTMLAttributes<HTMLElement> {
  activeId?: string;
  items: GlassNavItem[];
  onItemSelect?: (id: string) => void;
}

export function GlassNav({ activeId, className, items, onItemSelect, ...props }: GlassNavProps) {
  return (
    <nav
      className={cn(
        "surface-glass flex min-h-[44px] w-full items-center gap-[var(--space-sm)] overflow-x-auto rounded-[var(--radius-hero)] p-[var(--space-sm)] shadow-[var(--shadow-soft-lg)]",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.id === activeId;

        return (
          <Button
            className="shrink-0 min-h-[44px]"
            key={item.id}
            leadingIcon={item.icon}
            onClick={() => onItemSelect?.(item.id)}
            variant={active ? "primary" : "secondary"}
          >
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
