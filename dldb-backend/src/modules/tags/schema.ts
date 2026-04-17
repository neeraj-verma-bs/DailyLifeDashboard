import { z } from "zod";

const hexColor = z.string().regex(/^#([0-9a-fA-F]{6})$/, "Color must be #RRGGBB");

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(64),
  color: hexColor,
  group: z.string().trim().min(1).max(64).optional().nullable(),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = z
  .object({
    name: z.string().trim().min(1).max(64).optional(),
    color: hexColor.optional(),
    budget: z.number().positive().nullable().optional(),
    group: z.string().trim().min(1).max(64).nullable().optional(),
  })
  .refine(
    (v) => v.name !== undefined || v.color !== undefined || v.budget !== undefined || v.group !== undefined,
    { message: "At least one field is required" },
  );
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
});
