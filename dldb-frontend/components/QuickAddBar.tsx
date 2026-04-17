"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TagPicker } from "./TagPicker";
import { useGetTagsQuery } from "@/features/tags/api";
import { useAddEntryMutation } from "@/features/entries/api";

function deriveTypeFromTag(tagName: string | undefined): "task" | "expense" | "note" | null {
  if (tagName === "Task") return "task";
  if (tagName === "Expense") return "expense";
  if (tagName === "Note") return "note";
  return null;
}

export function QuickAddBar() {
  const [content, setContent] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const { data: tags = [] } = useGetTagsQuery();
  const [addEntry, { isLoading }] = useAddEntryMutation();

  const derivedType = useMemo(() => {
    const first = tagIds[0];
    const tag = tags.find((t) => t.id === first);
    return deriveTypeFromTag(tag?.name);
  }, [tagIds, tags]);

  const canSubmit =
    content.trim().length > 0 &&
    tagIds.length > 0 &&
    !isLoading &&
    (derivedType !== "expense" || amount.trim().length > 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const body = {
      content: content.trim(),
      tagIds,
      amount: derivedType === "expense" ? Number(amount) : null,
      dueDate: derivedType === "task" && dueDate ? new Date(dueDate).toISOString() : null,
    };
    try {
      await addEntry(body).unwrap();
      setContent("");
      setAmount("");
      setDueDate("");
      setTagIds([]);
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Could not add entry",
      );
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-0 z-20 px-3 py-2.5 flex flex-wrap items-center gap-2"
      style={{
        background: "rgba(7,9,26,0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='e.g. "Paid 500 for groceries"'
        className="flex-1 min-w-[160px] input-glass rounded-xl px-3 text-sm"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <TagPicker value={tagIds} onChange={setTagIds} />
        {derivedType === "expense" && (
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            className="w-24 input-glass rounded-xl px-3 text-sm"
          />
        )}
        {derivedType === "task" && (
          <input
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            type="date"
            className="input-glass rounded-xl px-3 text-sm"
          />
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 rounded-xl clay-btn text-white px-4 text-sm font-medium disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </form>
  );
}
