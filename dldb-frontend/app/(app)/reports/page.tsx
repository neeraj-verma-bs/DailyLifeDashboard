"use client";

import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";
import { useGetRangeQuery } from "@/features/dashboard/api";
import { useGetTagsQuery } from "@/features/tags/api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

type Preset = "week" | "month" | "custom";

function presetRange(preset: Preset, customFrom: string, customTo: string): { from: string; to: string } {
  const now = new Date();
  if (preset === "week") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
    const end = new Date(start.getTime() + 7 * 86400_000);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (preset === "month") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  return {
    from: customFrom ? new Date(customFrom).toISOString() : new Date().toISOString(),
    to: customTo ? new Date(customTo).toISOString() : new Date().toISOString(),
  };
}

function fmtMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-4"
      style={{
        background: "rgba(255,255,255,0.035)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { data: tags = [] } = useGetTagsQuery();

  const { from, to } = useMemo(
    () => presetRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  const { data, isLoading } = useGetRangeQuery(
    { from, to },
    { skip: preset === "custom" && (!customFrom || !customTo) },
  );

  const spendChartData = useMemo(
    () =>
      (data?.spendByTag ?? []).map(({ tagId, total }) => {
        const tag = tags.find((t) => t.id === tagId);
        return { name: tag?.name ?? tagId.slice(-4), total, color: tag?.color ?? "#6366F1" };
      }),
    [data, tags],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex gap-1 flex-wrap">
          {(["week", "month", "custom"] as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3 rounded-xl text-sm capitalize btn-ghost ${preset === p ? "!bg-[var(--color-accent-primary)] !border-transparent !text-white" : ""}`}
            >
              {p === "week" ? "This Week" : p === "month" ? "This Month" : "Custom"}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="input-glass rounded-xl px-3 text-sm"
            />
            <span className="text-[var(--color-text-secondary)] text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="input-glass rounded-xl px-3 text-sm"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-48" />
        </div>
      ) : !data ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Select a date range to view reports.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <SummaryCard label="Entries" value={data.summary.entriesCount} />
            <SummaryCard label="Spent" value={fmtMoney(data.summary.totalSpent)} />
            <SummaryCard label="Tasks done" value={data.summary.tasksDone} />
            <SummaryCard label="Tasks pending" value={data.summary.tasksPending} />
          </div>

          {spendChartData.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Spend by tag</h2>
              <div className="rounded-[var(--radius-card)] p-4" style={{ background: "rgba(255,255,255,0.035)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={spendChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                      formatter={(v) => [fmtMoney(typeof v === "number" ? v : 0), "Spent"]}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {spendChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {data.dailySeries.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Entries per day</h2>
              <div className="rounded-[var(--radius-card)] p-4" style={{ background: "rgba(255,255,255,0.035)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.dailySeries} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                    />
                    <Line type="monotone" dataKey="count" stroke="var(--color-accent-primary)" strokeWidth={2} dot={false} name="Entries" />
                    <Line type="monotone" dataKey="done" stroke="#22C55E" strokeWidth={1.5} dot={false} name="Done" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
          {(() => {
            const tagsWithBudget = tags.filter(
              (t) => t.budget !== null && t.budget > 0
            );
            if (!data || tagsWithBudget.length === 0) return null;
            return (
              <section>
                <h2 className="text-base font-semibold mb-3">Budget</h2>
                <div className="space-y-3 rounded-[var(--radius-card)] p-4" style={{ background: "rgba(255,255,255,0.035)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {tagsWithBudget.map((tag) => {
                    const spent = data.spendByTag.find((s) => s.tagId === tag.id)?.total ?? 0;
                    const pct = Math.min(100, Math.round((spent / tag.budget!) * 100));
                    const over = spent > tag.budget!;
                    return (
                      <div key={tag.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span>{tag.name}</span>
                          </div>
                          <span className={over ? "text-red-400" : "text-[var(--color-text-secondary)]"}>
                            {fmtMoney(spent)} / {fmtMoney(tag.budget!)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: over ? "#EF4444" : tag.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}
        </>
      )}
    </div>
  );
}
