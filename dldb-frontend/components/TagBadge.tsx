"use client";

import type { Tag } from "@/features/tags/schema";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
      style={{
        backgroundColor: hexToRgba(tag.color, 0.15),
        color: tag.color,
        borderColor: hexToRgba(tag.color, 0.4),
      }}
    >
      {tag.name}
    </span>
  );
}
