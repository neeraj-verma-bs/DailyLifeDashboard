import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createRecurringSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  tagIds: z.array(objectId).min(1, "At least one tag is required"),
  amount: z.number().positive().optional().nullable(),
  cadence: z.enum(["daily", "weekly", "monthly"]),
  startAt: z.coerce.date().optional(),
});
export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;

export const updateRecurringSchema = z.object({
  content: z.string().trim().min(1).max(2000).optional(),
  tagIds: z.array(objectId).min(1).optional(),
  amount: z.number().positive().nullable().optional(),
  cadence: z.enum(["daily", "weekly", "monthly"]).optional(),
  isActive: z.boolean().optional(),
}).refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
