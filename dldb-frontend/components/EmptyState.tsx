export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-8 text-center"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{title}</p>
      {children && (
        <div className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
