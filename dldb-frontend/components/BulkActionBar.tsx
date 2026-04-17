"use client";

import { Trash2, CheckCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useBulkDeleteMutation, useBulkUpdateStatusMutation } from "@/features/entries/api";

export function BulkActionBar({
  selectedIds,
  onDone,
}: {
  selectedIds: string[];
  onDone: () => void;
}) {
  const [bulkDelete, { isLoading: isDeleting }] = useBulkDeleteMutation();
  const [bulkUpdateStatus, { isLoading: isUpdating }] = useBulkUpdateStatusMutation();
  const count = selectedIds.length;

  const onDelete = async () => {
    try {
      await bulkDelete({ ids: selectedIds }).unwrap();
      toast.success(`Deleted ${count} ${count === 1 ? "entry" : "entries"}`);
      onDone();
    } catch {
      toast.error("Could not delete entries");
    }
  };

  const onMarkDone = async () => {
    try {
      await bulkUpdateStatus({ ids: selectedIds, status: "done" }).unwrap();
      toast.success(`Marked ${count} ${count === 1 ? "task" : "tasks"} as done`);
      onDone();
    } catch {
      toast.error("Could not update entries");
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-lg">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
        {count} selected
      </span>
      <button
        onClick={onMarkDone}
        disabled={isUpdating || isDeleting}
        className="flex items-center gap-1 text-sm px-3 py-1 rounded-md bg-[var(--color-accent-secondary)] text-white disabled:opacity-50"
      >
        <CheckCheck className="w-4 h-4" /> Mark done
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting || isUpdating}
        className="flex items-center gap-1 text-sm px-3 py-1 rounded-md bg-red-500 text-white disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
      <button
        onClick={onDone}
        aria-label="Clear selection"
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
