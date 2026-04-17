import { z } from "zod";

export type EntryType = "task" | "expense" | "note" | null;

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
};

export type Entry = {
  id: string;
  userId: string;
  content: string;
  tagIds: string[];
  type: EntryType;
  amount: number | null;
  status: "pending" | "done" | null;
  dueDate: string | null;
  pinned: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createEntrySchema = z.object({
  content: z.string().trim().min(1).max(2000),
  tagIds: z.array(objectId).min(1),
  amount: z.number().positive().nullable().optional(),
  status: z.enum(["pending", "done"]).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = createEntrySchema
  .extend({ pinned: z.boolean().optional() })
  .partial();
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export type EntriesPage = { items: Entry[]; nextCursor: string | null };
