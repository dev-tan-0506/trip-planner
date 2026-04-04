import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Input } from "./input";

const defaultSearchIcon = (
  <svg
    aria-hidden="true"
    fill="none"
    height="18"
    viewBox="0 0 24 24"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20 20L16.65 16.65" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
  </svg>
);

export interface SearchFieldProps extends Omit<ComponentPropsWithoutRef<typeof Input>, "type"> {
  icon?: ReactNode;
}

export function SearchField({
  icon = defaultSearchIcon,
  placeholder = "Tìm chuyến đi, địa điểm, checklist...",
  ...props
}: SearchFieldProps) {
  return (
    <Input
      leadingIcon={icon}
      placeholder={placeholder}
      type="search"
      wrapperClassName="w-full"
      {...props}
    />
  );
}
