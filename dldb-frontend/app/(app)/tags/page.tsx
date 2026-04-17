"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TagCard } from "@/components/TagCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useGetTagsQuery, useAddTagMutation } from "@/features/tags/api";

const PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7", "#EC4899", "#84CC16"];

export default function TagsPage() {
  const { data: tags, isLoading } = useGetTagsQuery();
  const [addTag, { isLoading: creating }] = useAddTagMutation();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]!);
  const [group, setGroup] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, NonNullable<typeof tags>>();
    for (const t of tags ?? []) {
      const key = t.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tags]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addTag({ name: name.trim(), color, group: group.trim() || null }).unwrap();
      setName("");
      setGroup("");
    } catch (err: unknown) {
      toast.error((err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Could not create tag");
    }
  };

  if (isLoading) return <LoadingSkeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tags</h1>
      <form
        onSubmit={submit}
        className="rounded-[var(--radius-card)] p-4 space-y-3"
        style={{
          background: "rgba(255,255,255,0.035)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-sm font-medium">New tag</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            className="flex-1 min-w-[140px] input-glass rounded-xl px-3 text-sm"
          />
          <input
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Group (optional)"
            className="w-36 input-glass rounded-xl px-3 text-sm"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="clay-btn rounded-xl text-white px-4 text-sm font-medium disabled:opacity-50"
          >
            Add tag
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Use color ${c}`}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: c, outline: c === color ? "2px solid #fff" : "none", outlineOffset: 2 }}
            />
          ))}
          <span className="text-xs text-[var(--color-text-secondary)] ml-1">Pick colour</span>
        </div>
      </form>

      {Array.from(grouped.entries()).map(([groupName, groupTags]) => (
        <section key={groupName}>
          {groupName && (
            <h2 className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
              {groupName}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupTags.map((t) => <TagCard key={t.id} tag={t} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
