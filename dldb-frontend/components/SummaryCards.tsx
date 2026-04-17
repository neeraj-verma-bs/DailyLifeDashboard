"use client";

import type { TodaySummary } from "@/features/dashboard/api";

const CARDS = [
  {
    key: "tasks" as const,
    label: "Tasks done",
    color: "#818CF8",
    glow: "rgba(129,140,248,0.3)",
  },
  {
    key: "spent" as const,
    label: "Spent today",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    key: "entries" as const,
    label: "Entries",
    color: "#34D399",
    glow: "rgba(52,211,153,0.25)",
  },
];

function fmtMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function StatCard({
  label,
  value,
  color,
  glow,
}: {
  label: string;
  value: string | number;
  color: string;
  glow: string;
}) {
  return (
    <div
      className="relative rounded-[var(--radius-card)] p-5 overflow-hidden group cursor-default"
      style={{
        background: "rgba(255,255,255,0.035)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.08)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />
      {/* Background glow orb */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-60"
        style={{ backgroundColor: color }}
      />

      <p
        className="text-[11px] uppercase tracking-widest font-semibold"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </p>
      <p className="mt-2.5 text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>

      {/* Bottom dot accent */}
      <div
        className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${glow}` }}
      />
    </div>
  );
}

export function SummaryCards({ summary }: { summary: TodaySummary }) {
  const values = [summary.tasksDone, fmtMoney(summary.totalSpent), summary.entriesCount];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CARDS.map((card, i) => (
        <StatCard key={card.key} label={card.label} value={values[i]!} color={card.color} glow={card.glow} />
      ))}
    </div>
  );
}
