import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Avatar, type AvatarProps } from "./avatar";

export interface ProfileChipProps extends HTMLAttributes<HTMLDivElement> {
  avatar: Pick<AvatarProps, "initials" | "size" | "src" | "status">;
  meta?: ReactNode;
  name: string;
}

export function ProfileChip({ avatar, className, meta, name, ...props }: ProfileChipProps) {
  return (
    <div
      className={cn(
        "inline-flex min-h-[44px] items-center gap-[var(--space-sm)] rounded-[var(--radius-pill)] bg-[var(--surface-section)] px-[var(--space-sm)] py-[var(--space-xs)] shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      <Avatar {...avatar} size={avatar.size ?? "sm"} />
      <div className="flex flex-col leading-none">
        <span className="font-[800] text-[var(--text-primary)]">{name}</span>
        {meta ? <span className="text-[12px] text-[var(--text-muted)]">{meta}</span> : null}
      </div>
    </div>
  );
}
