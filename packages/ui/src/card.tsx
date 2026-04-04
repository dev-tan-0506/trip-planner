import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./lib/utils";

type CardVariant = "base" | "lifted" | "glass";

const variantClasses: Record<CardVariant, string> = {
  base: "bg-[var(--surface-section)] shadow-[var(--shadow-soft)]",
  lifted: "bg-[var(--surface-card)] shadow-[var(--shadow-soft-lg)]",
  glass:
    "bg-[var(--surface-glass)] shadow-[var(--shadow-soft)] backdrop-blur-[var(--blur-glass)] supports-[backdrop-filter]:bg-[var(--surface-glass)]",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "base", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-large)] p-[var(--space-lg)] text-[var(--text-primary)] no-divider",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("mb-[var(--space-md)] flex flex-col gap-[var(--space-sm)]", className)} {...props} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-[var(--text-heading)]", className)} {...props} />;
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-[var(--text-muted)]", className)} {...props} />;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("flex flex-col gap-[var(--space-md)]", className)} {...props} />;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("mt-[var(--space-lg)] flex items-center gap-[var(--space-sm)]", className)} {...props} />;
}

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardMedia({ children, className, ...props }: CardMediaProps) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-base)]", className)} {...props}>
      {children}
    </div>
  );
}
