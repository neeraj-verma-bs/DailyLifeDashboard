"use client";

import { useState } from "react";
import { Trash2, Pause, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TagPicker } from "@/components/TagPicker";
import { useGetTagsQuery } from "@/features/tags/api";
import {
  useListRecurringQuery,
  useAddRecurringMutation,
  useToggleRecurringMutation,
  useDeleteRecurringMutation,
} from "@/features/recurring/api";
import type { RecurringEntry } from "@/features/recurring/schema";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { TagBadge } from "@/components/TagBadge";

const cardStyle = {
  background: "rgba(255,255,255,0.035)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
} as React.CSSProperties;

function RecurringRow({ rec }: { rec: RecurringEntry }) {
  const { data: tags = [] } = useGetTagsQuery();
  const [toggleRecurring] = useToggleRecurringMutation();
  const [deleteRecurring] = useDeleteRecurringMutation();
  const entryTags = tags.filter((t) => rec.tagIds.includes(t.id));

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{rec.content}</div>
        <div className="text-[11px] text-[var(--color-text-secondary)] flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
          <span className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span className="capitalize">{rec.cadence}</span>
          </span>
          <span>· next {new Date(rec.nextDueAt).toLocaleDateString()}</span>
          {!rec.isActive && <span className="text-yellow-500">· paused</span>}
        </div>
        {entryTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {entryTags.map((t) => <TagBadge key={t.id} tag={t} />)}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={async () => {
            try { await toggleRecurring({ id: rec.id, isActive: !rec.isActive }).unwrap(); }
            catch { toast.error("Could not update"); }
          }}
          aria-label={rec.isActive ? "Pause" : "Resume"}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {rec.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={async () => {
            try { await deleteRecurring(rec.id).unwrap(); }
            catch { toast.error("Could not delete"); }
          }}
          aria-label="Delete recurring entry"
          className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function RecurringPage() {
  const { data: items = [], isLoading } = useListRecurringQuery();
  const [addRecurring, { isLoading: isAdding }] = useAddRecurringMutation();

  const [content, setContent] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [cadence, setCadence] = useState<"daily" | "weekly" | "monthly">("daily");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || tagIds.length === 0) return;
    try {
      await addRecurring({ content: content.trim(), tagIds, cadence }).unwrap();
      setContent("");
      setTagIds([]);
      setCadence("daily");
    } catch {
      toast.error("Could not create recurring entry");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Recurring</h1>
      <form
        onSubmit={onSubmit}
        className="rounded-[var(--radius-card)] p-4 space-y-3"
        style={cardStyle}
      >
        <p className="text-sm font-medium">New recurring entry</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='e.g. "Daily standup"'
            className="flex-1 min-w-[160px] input-glass rounded-xl px-3 text-sm"
          />
          <TagPicker value={tagIds} onChange={setTagIds} />
          <select
            value={cadence}
            onChange={(e) => setCadence(e.target.value as typeof cadence)}
            className="select-glass rounded-xl px-3 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            type="submit"
            disabled={!content.trim() || tagIds.length === 0 || isAdding}
            className="clay-btn rounded-xl text-white px-4 text-sm font-medium disabled:opacity-50"
          >
            Add Recurring
          </button>
        </div>
      </form>
      {isLoading ? (
        <LoadingSkeleton className="h-32" />
      ) : items.length === 0 ? (
        <EmptyState title="No recurring entries">
          Use the form above to set up a daily, weekly, or monthly entry template.
        </EmptyState>
      ) : (
        <div
          className="rounded-[var(--radius-card)] overflow-hidden"
          style={cardStyle}
        >
          {items.map((rec, i) => (
            <div
              key={rec.id}
              style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.05)" } : undefined}
            >
              <RecurringRow rec={rec} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
