import { z } from "zod";

export type Goal = {
  id: string;
  userId: string;
  tagId: string;
  metric: "count" | "amount";
  direction: "at_least" | "at_most";
  target: number;
  cadence: "weekly" | "monthly";
  current: number;
  pct: number;
  met: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createGoalSchema = z.object({
  tagId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
  metric: z.enum(["count", "amount"]),
  direction: z.enum(["at_least", "at_most"]),
  target: z.number().positive(),
  cadence: z.enum(["weekly", "monthly"]),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
