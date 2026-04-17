"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useGetTagsQuery, useAddTagMutation } from "@/features/tags/api";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PALETTE = [
  "#6366F1", "#22C55E", "#F59E0B", "#EF4444",
  "#06B6D4", "#A855F7", "#EC4899", "#84CC16",
];

export function TagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { data: tags = [] } = useGetTagsQuery();
  const [addTag, { isLoading: adding }] = useAddTagMutation();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_PALETTE[0]!);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = useMemo(() => new Set(value), [value]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    const ordered = value
      .filter((v) => next.has(v))
      .concat(Array.from(next).filter((v) => !value.includes(v)));
    onChange(ordered);
  };

  const createTag = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const t = await addTag({ name, color: newColor }).unwrap();
      setNewName("");
      onChange([...value, t.id]);
    } catch (err: unknown) {
      toast.error((err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Could not create tag");
    }
  };

  // Group tags: { groupName → tags[] }. Ungrouped tags go under key "".
  const grouped = useMemo(() => {
    const map = new Map<string, typeof tags>();
    for (const t of tags) {
      const key = t.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tags]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-glass flex items-center gap-1.5 rounded-xl px-3 text-xs font-medium"
        style={{ height: 36 }}
      >
        Tags
        {value.length > 0 && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-tight"
            style={{ background: "rgba(129,140,248,0.25)", color: "#818CF8" }}
          >
            {value.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 mb-2 right-0 w-64 rounded-xl p-2"
          style={{
            background: "rgba(11,14,31,0.95)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
            top: "calc(100% + 10px)",
          }}
        >
          <div className="max-h-48 overflow-auto space-y-0.5">
            {Array.from(grouped.entries()).map(([group, groupTags]) => (
              <div key={group}>
                {group && (
                  <p className="px-2 pt-2 pb-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {group}
                  </p>
                )}
                {groupTags.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left transition-colors"
                    style={selected.has(t.id) ? { background: "rgba(129,140,248,0.12)" } : undefined}
                    onMouseEnter={(e) => { if (!selected.has(t.id)) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (!selected.has(t.id)) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="text-sm">{t.name}</span>
                    </span>
                    {selected.has(t.id) && <Check className="w-4 h-4 text-[var(--color-accent-primary)]" />}
                  </button>
                ))}
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-xs text-[var(--color-text-secondary)] px-2 py-1">No tags yet</p>
            )}
          </div>
          <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-1.5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createTag(); } }}
                placeholder="New tag…"
                className="input-glass flex-1 rounded-lg px-2 text-xs"
                style={{ height: 30 }}
              />
              <button
                type="button"
                onClick={createTag}
                disabled={adding || !newName.trim()}
                className="clay-btn rounded-lg text-white disabled:opacity-50 flex items-center justify-center"
                style={{ width: 30, height: 30 }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              {DEFAULT_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className="w-5 h-5 rounded-full border"
                  style={{ backgroundColor: c, borderColor: c === newColor ? "#fff" : "transparent" }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setNewColor(DEFAULT_PALETTE[0]!)}
                className="ml-auto text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                aria-label="Reset color"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
