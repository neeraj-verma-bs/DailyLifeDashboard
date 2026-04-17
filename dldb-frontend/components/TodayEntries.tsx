"use client";

import type { Entry } from "@/features/entries/schema";
import { EntryRow } from "./EntryRow";
import { EmptyState } from "./EmptyState";

export function TodayEntries({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState title="Nothing logged today">
        Use the quick-add bar above to log your first entry.
      </EmptyState>
    );
  }
  return (
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
      {entries.map((e, i) => (
        <div
          key={e.id}
          style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.05)" } : undefined}
        >
          <EntryRow entry={e} />
        </div>
      ))}
    </div>
  );
}
