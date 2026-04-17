"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { LayoutDashboard, ListTodo, Tags, RefreshCw, BarChart2, Search } from "lucide-react";
import { useGetTagsQuery } from "@/features/tags/api";

const NAV_COMMANDS = [
  { label: "Go to Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Go to Entries", href: "/entries", Icon: ListTodo },
  { label: "Go to Tags", href: "/tags", Icon: Tags },
  { label: "Go to Recurring", href: "/recurring", Icon: RefreshCw },
  { label: "Go to Reports", href: "/reports", Icon: BarChart2 },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: tags = [] } = useGetTagsQuery();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="[&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-[var(--color-border)]">
          <Command.Input
            placeholder="Search commands…"
            className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--color-text-secondary)]"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigate"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--color-text-secondary)]"
            >
              {NAV_COMMANDS.map(({ label, href, Icon }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => run(() => router.push(href))}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-[var(--color-surface)] aria-selected:text-[var(--color-accent-primary)]"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>

            {tags.length > 0 && (
              <Command.Group
                heading="Filter by tag"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--color-text-secondary)]"
              >
                {tags.map((t) => (
                  <Command.Item
                    key={t.id}
                    value={`Filter by ${t.name}`}
                    onSelect={() => run(() => router.push(`/entries?tagId=${t.id}`))}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-[var(--color-surface)] aria-selected:text-[var(--color-accent-primary)]"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <Search className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-secondary)]" />
                    Filter by {t.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
