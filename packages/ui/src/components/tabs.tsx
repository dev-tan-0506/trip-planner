"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex min-h-[44px] items-center gap-[var(--space-xs)] rounded-[var(--radius-pill)] bg-[var(--surface-section)] p-[var(--space-xs)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-[var(--radius-pill)] px-[var(--space-md)] py-[var(--space-sm)] text-[var(--text-label)] font-[800] uppercase tracking-[0.06em] text-[var(--text-muted)] transition-colors data-[state=active]:bg-[var(--accent-primary)] data-[state=active]:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-[var(--space-lg)] outline-none", className)} {...props} />;
}
