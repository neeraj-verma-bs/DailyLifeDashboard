"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useGetTagsQuery } from "@/features/tags/api";
import { useGetGoalsQuery, useAddGoalMutation, useDeleteGoalMutation } from "@/features/goals/api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { CreateGoalInput } from "@/features/goals/schema";

function fmtValue(metric: "count" | "amount", n: number): string {
  if (metric === "amount") return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return String(n);
}

function ProgressBar({
  pct,
  met,
  direction,
}: {
  pct: number;
  met: boolean;
  direction: "at_least" | "at_most";
}) {
  let barColor: string;
  if (direction === "at_least") {
    barColor = met ? "#22C55E" : "#6366F1";
  } else {
    barColor = !met ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#22C55E";
  }
  return (
    <div className="h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

export default function GoalsPage() {
  const { data: goals, isLoading } = useGetGoalsQuery();
  const { data: tags = [] } = useGetTagsQuery();
  const [addGoal, { isLoading: creating }] = useAddGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const [form, setForm] = useState<Partial<CreateGoalInput>>({
    metric: "count",
    direction: "at_least",
    cadence: "weekly",
  });

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tagId || !form.target || form.target <= 0) {
      toast.error("Select a tag and enter a positive target");
      return;
    }
    try {
      await addGoal(form as CreateGoalInput).unwrap();
      setForm({ metric: "count", direction: "at_least", cadence: "weekly" });
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
          "Could not create goal",
      );
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id).unwrap();
    } catch {
      toast.error("Could not delete goal");
    }
  };

  if (isLoading) return <LoadingSkeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Goals</h1>

      <form
        onSubmit={submit}
        className="rounded-[var(--radius-card)] p-4 space-y-3"
        style={{ background: "rgba(255,255,255,0.035)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-sm font-medium">New goal</p>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={form.tagId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, tagId: e.target.value }))}
            className="select-glass rounded-xl px-3 text-sm flex-1 min-w-[120px]"
          >
            <option value="">Select tag…</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={form.metric}
            onChange={(e) =>
              setForm((f) => ({ ...f, metric: e.target.value as "count" | "amount" }))
            }
            className="select-glass rounded-xl px-3 text-sm"
          >
            <option value="count">Count (entries)</option>
            <option value="amount">Amount (₹)</option>
          </select>
          <select
            value={form.direction}
            onChange={(e) =>
              setForm((f) => ({ ...f, direction: e.target.value as "at_least" | "at_most" }))
            }
            className="select-glass rounded-xl px-3 text-sm"
          >
            <option value="at_least">At least</option>
            <option value="at_most">At most</option>
          </select>
          <input
            type="number"
            min="1"
            step="1"
            value={form.target ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, target: Number(e.target.value) }))}
            placeholder="Target"
            className="w-24 input-glass rounded-xl px-3 text-sm"
          />
          <select
            value={form.cadence}
            onChange={(e) =>
              setForm((f) => ({ ...f, cadence: e.target.value as "weekly" | "monthly" }))
            }
            className="select-glass rounded-xl px-3 text-sm"
          >
            <option value="weekly">Per week</option>
            <option value="monthly">Per month</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="clay-btn rounded-xl text-white px-4 text-sm font-medium disabled:opacity-50"
          >
            Add goal
          </button>
        </div>
      </form>

      {(goals ?? []).length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">No goals yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {(goals ?? []).map((goal) => {
            const tag = tagMap[goal.tagId];
            const dirLabel = goal.direction === "at_least" ? "≥" : "≤";
            const cadLabel = goal.cadence === "weekly" ? "/ week" : "/ month";
            const label = `${dirLabel} ${fmtValue(goal.metric, goal.target)} ${cadLabel}`;
            return (
              <div
                key={goal.id}
                className="rounded-[var(--radius-card)] p-4 space-y-2"
                style={{ background: "rgba(255,255,255,0.035)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {tag && (
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    <span className="text-sm font-medium">{tag?.name ?? goal.tagId}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                    {goal.met && (
                      <span className="text-xs bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">
                        Met ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {fmtValue(goal.metric, goal.current)} / {fmtValue(goal.metric, goal.target)}
                    </span>
                    <button
                      onClick={() => onDelete(goal.id)}
                      className="text-[var(--color-text-secondary)] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <ProgressBar pct={goal.pct} met={goal.met} direction={goal.direction} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
