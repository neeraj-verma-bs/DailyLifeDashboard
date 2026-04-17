import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createEntrySchema = z.object({
  content: z.string().trim().min(1).max(2000),
  tagIds: z.array(objectId).min(1, "At least one tag is required"),
  amount: z.number().positive().optional().nullable(),
  status: z.enum(["pending", "done"]).optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = createEntrySchema
  .extend({ pinned: z.boolean().optional() })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export const listEntriesQuerySchema = z.object({
  tagId: objectId.optional(),
  type: z.enum(["task", "expense", "note"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
  search: z.string().trim().min(1).max(200).optional(),
});
export type ListEntriesQuery = z.infer<typeof listEntriesQuerySchema>;

export const addCommentSchema = z.object({ text: z.string().trim().min(1).max(500) });
export type AddCommentInput = z.infer<typeof addCommentSchema>;

export const bulkDeleteSchema = z.object({
  ids: z.array(objectId).min(1).max(100),
});
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

export const bulkStatusSchema = z.object({
  ids: z.array(objectId).min(1).max(100),
  status: z.enum(["pending", "done"]),
});
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;

export const exportQuerySchema = z.object({
  format: z.enum(["csv", "json"]).default("json"),
  tagId: objectId.optional(),
  type: z.enum(["task", "expense", "note"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ExportQuery = z.infer<typeof exportQuerySchema>;
