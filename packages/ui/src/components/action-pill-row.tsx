import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../button";
import { cn } from "../lib/utils";

export interface ActionPillItem {
  icon?: ReactNode;
  id: string;
  label: string;
}

export interface ActionPillRowProps extends HTMLAttributes<HTMLDivElement> {
  activeId?: string;
  items: ActionPillItem[];
  onItemSelect?: (id: string) => void;
}

export function ActionPillRow({ activeId, className, items, onItemSelect, ...props }: ActionPillRowProps) {
  return (
    <div className={cn("flex flex-wrap gap-[var(--space-sm)]", className)} {...props}>
      {items.map((item) => {
        const active = item.id === activeId;

        return (
          <Button
            className="min-h-[44px] rounded-[var(--radius-large)]"
            key={item.id}
            leadingIcon={item.icon}
            onClick={() => onItemSelect?.(item.id)}
            size="sm"
            variant={active ? "primary" : "secondary"}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
