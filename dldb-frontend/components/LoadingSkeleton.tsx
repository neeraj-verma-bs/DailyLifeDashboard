export function LoadingSkeleton({ className = "h-6 w-full" }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] skeleton-shimmer ${className}`}
      aria-hidden="true"
      style={{ border: "1px solid rgba(255,255,255,0.04)" }}
    />
  );
}
