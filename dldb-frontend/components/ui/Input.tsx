"use client";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)]",
          "px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent",
          className,
        ].join(" ")}
        {...rest}
      />
    );
  },
);
