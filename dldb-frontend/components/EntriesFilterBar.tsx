"use client";

import type { EntryType } from "@/features/entries/schema";
import { useGetTagsQuery } from "@/features/tags/api";

export type EntriesFilter = {
  tagId?: string;
  type?: Exclude<EntryType, null>;
  from?: string;
  to?: string;
  search?: string;
};

export function EntriesFilterBar({
  value,
  onChange,
}: {
  value: EntriesFilter;
  onChange: (next: EntriesFilter) => void;
}) {
  const { data: tags = [] } = useGetTagsQuery();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={value.search ?? ""}
        onChange={(e) => onChange({ ...value, search: e.target.value || undefined })}
        placeholder="Search entries…"
        className="input-glass rounded-xl px-3 text-sm flex-1 min-w-[130px]"
      />
      <select
        value={value.type ?? ""}
        onChange={(e) => onChange({ ...value, type: (e.target.value || undefined) as EntriesFilter["type"] })}
        className="select-glass rounded-xl px-3 text-sm"
      >
        <option value="">All types</option>
        <option value="task">Task</option>
        <option value="expense">Expense</option>
        <option value="note">Note</option>
      </select>
      <select
        value={value.tagId ?? ""}
        onChange={(e) => onChange({ ...value, tagId: e.target.value || undefined })}
        className="select-glass rounded-xl px-3 text-sm"
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <input
        type="date"
        value={value.from?.slice(0, 10) ?? ""}
        onChange={(e) => onChange({ ...value, from: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
        className="input-glass rounded-xl px-3 text-sm"
      />
      <input
        type="date"
        value={value.to?.slice(0, 10) ?? ""}
        onChange={(e) => {
          const end = e.target.value ? new Date(e.target.value) : undefined;
          if (end) end.setUTCHours(23, 59, 59, 999);
          onChange({ ...value, to: end?.toISOString() });
        }}
        className="input-glass rounded-xl px-3 text-sm"
      />
      {(value.tagId || value.type || value.from || value.to || value.search) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="btn-ghost rounded-xl px-3 text-xs font-medium"
        >
          Clear
        </button>
      )}
    </div>
  );
}
