"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EntriesFilterBar, type EntriesFilter } from "@/components/EntriesFilterBar";
import { EntryRow } from "@/components/EntryRow";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { BulkActionBar } from "@/components/BulkActionBar";
import { useListEntriesQuery } from "@/features/entries/api";

export default function EntriesPage() {
  const [filter, setFilter] = useState<EntriesFilter>({});
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filter.search), 300);
    return () => clearTimeout(t);
  }, [filter.search]);

  const args = useMemo(
    () => ({
      tagId: filter.tagId,
      type: filter.type,
      from: filter.from,
      to: filter.to,
      search: debouncedSearch,
      cursor,
      limit: 50,
    }),
    [filter, cursor, debouncedSearch],
  );

  const { data, isLoading, isFetching } = useListEntriesQuery(args);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

  const downloadExport = async (format: "csv" | "json") => {
    const params = new URLSearchParams({ format });
    if (filter.tagId) params.set("tagId", filter.tagId);
    if (filter.type) params.set("type", filter.type);
    if (filter.from) params.set("from", filter.from);
    if (filter.to) params.set("to", filter.to);
    if (debouncedSearch) params.set("search", debouncedSearch);
    try {
      const res = await fetch(`${apiBase}/entries/export?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `entries.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Entries</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadExport("csv")}
            className="btn-ghost rounded-xl px-3 text-xs font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={() => downloadExport("json")}
            className="btn-ghost rounded-xl px-3 text-xs font-medium"
          >
            Export JSON
          </button>
        </div>
      </div>
      <EntriesFilterBar
        value={filter}
        onChange={(f) => { setFilter(f); setCursor(undefined); }}
      />
      {isLoading ? (
        <LoadingSkeleton className="h-48" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No entries match your filters" />
      ) : (
        <div
          className="rounded-[var(--radius-card)] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {data.items.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              selected={selected.has(e.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}
      {data?.nextCursor && (
        <div className="flex justify-center">
          <button
            onClick={() => setCursor(data.nextCursor ?? undefined)}
            disabled={isFetching}
            className="btn-ghost rounded-xl px-4 text-sm font-medium"
          >
            {isFetching ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
      {selected.size > 0 && (
        <BulkActionBar
          selectedIds={[...selected]}
          onDone={clearSelection}
        />
      )}
    </div>
  );
}
