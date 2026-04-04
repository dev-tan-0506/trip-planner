import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";
import { NotificationTrigger } from "./notification-trigger";
import { ProfileChip, type ProfileChipProps } from "./profile-chip";
import { SearchField, type SearchFieldProps } from "./search-field";

export interface AppHeaderProps extends HTMLAttributes<HTMLElement> {
  notificationCount?: number;
  onSearchChange?: SearchFieldProps["onChange"];
  profile: ProfileChipProps;
  productMark: ReactNode;
  searchProps?: Omit<SearchFieldProps, "onChange">;
  trailingAction?: ReactNode;
}

export function AppHeader({
  className,
  notificationCount = 0,
  onSearchChange,
  productMark,
  profile,
  searchProps,
  trailingAction,
  ...props
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "surface-glass flex flex-col gap-[var(--space-md)] rounded-[var(--radius-hero)] p-[var(--space-lg)] shadow-[var(--shadow-soft-lg)] md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-[var(--space-md)]">
        <div className="shrink-0">{productMark}</div>
        <div className="w-full max-w-[32rem] flex-1">
          <SearchField onChange={onSearchChange} {...searchProps} />
        </div>
      </div>

      <div className="flex items-center gap-[var(--space-sm)] self-end md:self-auto">
        <NotificationTrigger unread={notificationCount} />
        <ProfileChip {...profile} />
        {trailingAction}
      </div>
    </header>
  );
}
