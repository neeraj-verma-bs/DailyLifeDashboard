import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createGoalSchema = z.object({
  tagId: objectId,
  metric: z.enum(["count", "amount"]),
  direction: z.enum(["at_least", "at_most"]),
  target: z.number().positive(),
  cadence: z.enum(["weekly", "monthly"]),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const idParamSchema = z.object({ id: objectId });
