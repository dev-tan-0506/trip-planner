import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../lib/utils";
import { IconButton } from "./icon-button";

const defaultBellIcon = (
  <svg
    aria-hidden="true"
    fill="none"
    height="18"
    viewBox="0 0 24 24"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 18H16M9 21H15M18 16V11C18 7.68629 15.3137 5 12 5C8.68629 5 6 7.68629 6 11V16L4 18H20L18 16Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

export interface NotificationTriggerProps extends Omit<ComponentPropsWithoutRef<typeof IconButton>, "icon"> {
  icon?: ReactNode;
  unread?: number;
}

export function NotificationTrigger({
  className,
  icon = defaultBellIcon,
  unread = 0,
  ...props
}: NotificationTriggerProps) {
  const hasUnread = unread > 0;

  return (
    <div className="relative inline-flex">
      <IconButton
        aria-label={hasUnread ? `${unread} thông báo chưa đọc` : "Mở thông báo"}
        className={className}
        icon={icon}
        shape="rounded-2xl"
        variant="secondary"
        {...props}
      />
      {hasUnread ? (
        <span
          className={cn(
            "absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-1 text-[11px] font-[800] text-white",
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      ) : (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--surface-outline)]" />
      )}
    </div>
  );
}
