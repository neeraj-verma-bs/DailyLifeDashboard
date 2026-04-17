"use client";

import { useState } from "react";
import { Check, Trash2, Circle, Pin, PinOff, MessageSquare } from "lucide-react";
import { TagBadge } from "./TagBadge";
import { CommentThread } from "./CommentThread";
import { useGetTagsQuery } from "@/features/tags/api";
import { useDeleteEntryMutation, useUpdateEntryMutation } from "@/features/entries/api";
import type { Entry } from "@/features/entries/schema";
import { toast } from "sonner";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function fmtMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function EntryRow({
  entry,
  selected,
  onToggleSelect,
}: {
  entry: Entry;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const { data: tags = [] } = useGetTagsQuery();
  const [updateEntry] = useUpdateEntryMutation();
  const [deleteEntry] = useDeleteEntryMutation();
  const [showComments, setShowComments] = useState(false);
  const entryTags = tags.filter((t) => entry.tagIds.includes(t.id));

  const toggleStatus = async () => {
    if (entry.type !== "task") return;
    const next = entry.status === "done" ? "pending" : "done";
    try {
      await updateEntry({ id: entry.id, body: { status: next } }).unwrap();
    } catch {
      toast.error("Could not update task");
    }
  };

  const togglePin = async () => {
    try {
      await updateEntry({ id: entry.id, body: { pinned: !entry.pinned } }).unwrap();
    } catch {
      toast.error("Could not pin entry");
    }
  };

  const onDelete = async () => {
    try {
      await deleteEntry(entry.id).unwrap();
    } catch {
      toast.error("Could not delete entry");
    }
  };

  return (
    <div>
      <div
        className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150"
        style={selected ? { background: "rgba(255,255,255,0.06)" } : undefined}
        onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = ""; }}
      >
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={selected ?? false}
            onChange={() => onToggleSelect(entry.id)}
            className="accent-[var(--color-accent-primary)] w-4 h-4 shrink-0"
          />
        )}
        {entry.type === "task" ? (
          <button
            onClick={toggleStatus}
            aria-label={entry.status === "done" ? "Mark as pending" : "Mark as done"}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-secondary)]"
          >
            {entry.status === "done" ? (
              <Check className="w-4 h-4 text-[var(--color-accent-secondary)]" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4" />
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-sm truncate ${entry.status === "done" ? "line-through text-[var(--color-text-secondary)]" : ""}`}>
            {entry.content}
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
            <span>{fmtTime(entry.createdAt)}</span>
            {entry.amount !== null && <span>· {fmtMoney(entry.amount)}</span>}
            {entry.dueDate && <span>· due {new Date(entry.dueDate).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {entryTags.map((t) => (
            <TagBadge key={t.id} tag={t} />
          ))}
        </div>
        <button
          onClick={() => setShowComments((v) => !v)}
          aria-label="Toggle comments"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          {entry.comments.length > 0 && (
            <span className="text-[10px]">{entry.comments.length}</span>
          )}
        </button>
        <button
          onClick={togglePin}
          aria-label={entry.pinned ? "Unpin entry" : "Pin entry"}
          className={`sm:opacity-0 sm:group-hover:opacity-100 ${entry.pinned ? "opacity-100 text-[var(--color-accent-primary)]" : "opacity-60 sm:opacity-0 text-[var(--color-text-secondary)]"}`}
        >
          {entry.pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete entry"
          className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {showComments && <CommentThread entry={entry} />}
    </div>
  );
}
