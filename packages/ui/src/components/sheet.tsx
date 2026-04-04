"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-[rgba(47,46,46,0.35)] backdrop-blur-[6px]", className)}
      {...props}
    />
  );
}

export function SheetContent({
  className,
  side = "bottom",
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "bottom" | "right";
}) {
  const sideClasses =
    side === "right"
      ? "right-0 top-0 h-full w-[min(92vw,28rem)] rounded-l-[var(--radius-hero)]"
      : "bottom-0 left-0 w-full rounded-t-[var(--radius-hero)]";

  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-[var(--surface-card)] p-[var(--space-xl)] shadow-[var(--shadow-soft-lg)]",
          sideClasses,
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-[var(--space-lg)] flex flex-col gap-[var(--space-sm)]", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-[var(--text-heading)]", className)} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-[var(--text-muted)]", className)} {...props} />;
}
