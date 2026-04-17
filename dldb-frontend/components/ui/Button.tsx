"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className = "", ...rest },
  ref,
) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-[filter,background] duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<Variant, string> = {
    primary: "bg-[var(--color-accent-primary)] text-white hover:brightness-110",
    ghost:
      "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]",
    danger: "bg-red-600 text-white hover:brightness-110",
  };
  return <button ref={ref} className={`${base} ${styles[variant]} ${className}`} {...rest} />;
});
