"use client";

import { useState } from "react";
import { Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAddCommentMutation, useDeleteCommentMutation } from "@/features/entries/api";
import type { Entry } from "@/features/entries/schema";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function CommentThread({ entry }: { entry: Entry }) {
  const [text, setText] = useState("");
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addComment({ entryId: entry.id, text: text.trim() }).unwrap();
      setText("");
    } catch {
      toast.error("Could not add comment");
    }
  };

  const onDelete = async (commentId: string) => {
    try {
      await deleteComment({ entryId: entry.id, commentId }).unwrap();
    } catch {
      toast.error("Could not delete comment");
    }
  };

  return (
    <div className="ml-10 mr-3 mb-2 space-y-1">
      {entry.comments.map((c) => (
        <div
          key={c.id}
          className="group flex items-start gap-2 text-sm text-[var(--color-text-secondary)] px-2 py-1 rounded hover:bg-[var(--color-bg-primary)]"
        >
          <span className="flex-1 break-words">{c.text}</span>
          <span className="shrink-0 text-[10px] mt-0.5">{fmtTime(c.createdAt)}</span>
          <button
            onClick={() => onDelete(c.id)}
            aria-label="Delete comment"
            className="opacity-0 group-hover:opacity-100 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <form onSubmit={onSubmit} className="flex items-center gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note…"
          maxLength={500}
          className="flex-1 text-sm rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
        />
        <button
          type="submit"
          disabled={!text.trim() || isAdding}
          aria-label="Add comment"
          className="text-[var(--color-accent-primary)] disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
