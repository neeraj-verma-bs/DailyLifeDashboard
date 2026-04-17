import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export type RecurringEntry = {
  id: string;
  userId: string;
  content: string;
  tagIds: string[];
  amount: number | null;
  cadence: "daily" | "weekly" | "monthly";
  nextDueAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createRecurringSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  tagIds: z.array(objectId).min(1),
  amount: z.number().positive().nullable().optional(),
  cadence: z.enum(["daily", "weekly", "monthly"]),
  startAt: z.string().optional(),
});
export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
