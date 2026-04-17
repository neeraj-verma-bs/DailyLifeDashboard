"use client";

import Link from "next/link";
import { SummaryCards } from "@/components/SummaryCards";
import { TodayEntries } from "@/components/TodayEntries";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useGetTodayQuery } from "@/features/dashboard/api";
import { useGetGoalsQuery } from "@/features/goals/api";
import { useGetTagsQuery } from "@/features/tags/api";

function fmtValue(metric: "count" | "amount", n: number): string {
  if (metric === "amount") return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return String(n);
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetTodayQuery();
  const { data: goals = [] } = useGetGoalsQuery();
  const { data: tags = [] } = useGetTagsQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-48" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="text-sm text-red-400">Failed to load dashboard.</p>;
  }

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));
  const topGoals = goals.slice(0, 4);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Today</h1>
      <SummaryCards summary={data.summary} />

      {topGoals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Goals</h2>
            <Link
              href="/goals"
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topGoals.map((goal) => {
              const tag = tagMap[goal.tagId];
              const dirLabel = goal.direction === "at_least" ? "≥" : "≤";
              const cadLabel = goal.cadence === "weekly" ? "wk" : "mo";
              const barColor =
                goal.direction === "at_least"
                  ? goal.met
                    ? "#22C55E"
                    : "#6366F1"
                  : !goal.met
                    ? "#EF4444"
                    : goal.pct >= 80
                      ? "#F59E0B"
                      : "#22C55E";
              return (
                <div
                  key={goal.id}
                  className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {tag && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <span className="font-medium">{tag?.name ?? "–"}</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {dirLabel} {fmtValue(goal.metric, goal.target)}/{cadLabel}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${goal.pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {fmtValue(goal.metric, goal.current)} / {fmtValue(goal.metric, goal.target)}
                    {goal.met && " · ✓ Met"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent entries</h2>
        <TodayEntries entries={data.recentEntries} />
      </section>
    </div>
  );
}
