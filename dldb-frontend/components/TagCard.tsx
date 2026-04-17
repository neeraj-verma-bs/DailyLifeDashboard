"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tag } from "@/features/tags/schema";
import { useDeleteTagMutation, useUpdateTagMutation } from "@/features/tags/api";

const PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7", "#EC4899", "#84CC16", "#3B82F6", "#9CA3AF"];

function fmtMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function TagCard({ tag }: { tag: Tag }) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [budget, setBudget] = useState(tag.budget !== null ? String(tag.budget) : "");
  const [updateTag, { isLoading: saving }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: deleting }] = useDeleteTagMutation();

  useEffect(() => {
    setName(tag.name);
    setColor(tag.color);
    setBudget(tag.budget !== null ? String(tag.budget) : "");
  }, [tag.name, tag.color, tag.budget]);

  const budgetNum = budget.trim() === "" ? null : Number(budget);
  const dirty = name !== tag.name || color !== tag.color || budgetNum !== tag.budget;

  const save = async () => {
    try {
      await updateTag({ id: tag.id, body: { name, color, budget: budgetNum } }).unwrap();
      toast.success("Tag updated");
    } catch (err: unknown) {
      toast.error((err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Could not update tag");
    }
  };

  const onDelete = async () => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    try {
      await deleteTag(tag.id).unwrap();
      toast.success("Tag deleted");
    } catch (err: unknown) {
      toast.error((err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Could not delete tag");
    }
  };

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent-primary)] focus:outline-none text-sm"
        />
        {tag.isSystem && (
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">system</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Use color ${c}`}
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: c, outline: c === color ? "2px solid #fff" : "none", outlineOffset: 1 }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)] w-16 shrink-0">Budget/mo</span>
        <input
          type="number"
          min="0"
          step="1"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="No budget"
          className="flex-1 w-full rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-1 text-sm"
        />
        {tag.budget !== null && (
          <span className="text-xs text-[var(--color-text-secondary)]">{fmtMoney(tag.budget)}</span>
        )}
      </div>
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent-primary)] text-white px-3 py-1.5 text-xs disabled:opacity-50"
        >
          <Check className="w-3 h-3" /> Save
        </button>
        <button
          onClick={onDelete}
          disabled={tag.isSystem || deleting}
          title={tag.isSystem ? "System tags cannot be deleted" : undefined}
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}
