import mongoose from "mongoose";
import { RecurringEntry, type RecurringEntryDoc } from "./model.js";
import { Entry } from "../entries/model.js";
import { Tag } from "../tags/model.js";
import type { CreateRecurringInput, UpdateRecurringInput } from "./schema.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";

function asObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function computeNextDueAt(cadence: "daily" | "weekly" | "monthly", from: Date): Date {
  const next = new Date(from);
  if (cadence === "daily") next.setUTCDate(next.getUTCDate() + 1);
  else if (cadence === "weekly") next.setUTCDate(next.getUTCDate() + 7);
  else next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

export async function listRecurring(userId: string): Promise<RecurringEntryDoc[]> {
  return RecurringEntry.find({ userId: asObjectId(userId) }).sort({ createdAt: -1 });
}

export async function createRecurring(
  userId: string,
  input: CreateRecurringInput,
): Promise<RecurringEntryDoc> {
  const userObj = asObjectId(userId);
  const tagCount = await Tag.countDocuments({ _id: { $in: input.tagIds.map(asObjectId) }, userId: userObj });
  if (tagCount !== input.tagIds.length) {
    throw new ValidationError({ tagIds: ["One or more tags not found"] });
  }
  const startAt = input.startAt ?? new Date();
  const nextDueAt = new Date(startAt);
  nextDueAt.setUTCHours(0, 0, 0, 0);
  return RecurringEntry.create({
    userId: userObj,
    content: input.content,
    tagIds: input.tagIds.map(asObjectId),
    amount: input.amount ?? null,
    cadence: input.cadence,
    nextDueAt,
  });
}

export async function updateRecurring(
  userId: string,
  id: string,
  input: UpdateRecurringInput,
): Promise<RecurringEntryDoc> {
  const rec = await RecurringEntry.findOne({ _id: asObjectId(id), userId: asObjectId(userId) });
  if (!rec) throw new NotFoundError("Recurring entry not found", "RECURRING_NOT_FOUND");
  if (input.content !== undefined) rec.content = input.content;
  if (input.tagIds !== undefined) rec.tagIds = input.tagIds.map(asObjectId) as unknown as typeof rec.tagIds;
  if (input.amount !== undefined) rec.amount = input.amount ?? null;
  if (input.cadence !== undefined) rec.cadence = input.cadence;
  if (input.isActive !== undefined) rec.isActive = input.isActive;
  await rec.save();
  return rec;
}

export async function deleteRecurring(userId: string, id: string): Promise<void> {
  const res = await RecurringEntry.deleteOne({ _id: asObjectId(id), userId: asObjectId(userId) });
  if (res.deletedCount === 0) throw new NotFoundError("Recurring entry not found", "RECURRING_NOT_FOUND");
}

let cronRunning = false;

export async function tickRecurring(): Promise<void> {
  if (cronRunning) return;
  cronRunning = true;
  try {
    const now = new Date();
    const due = await RecurringEntry.find({ nextDueAt: { $lte: now }, isActive: true });
    for (const rec of due) {
      const primaryTag = await Tag.findById(rec.tagIds[0]);
      if (!primaryTag) continue;
      const type =
        primaryTag.name === "Task" ? "task" :
        primaryTag.name === "Expense" ? "expense" :
        primaryTag.name === "Note" ? "note" : null;
      await Entry.create({
        userId: rec.userId,
        content: rec.content,
        tagIds: rec.tagIds,
        type,
        amount: type === "expense" ? (rec.amount ?? null) : null,
        status: type === "task" ? "pending" : null,
        dueDate: type === "task" ? rec.nextDueAt : null,
      });
      rec.nextDueAt = computeNextDueAt(rec.cadence as "daily" | "weekly" | "monthly", rec.nextDueAt as Date);
      await rec.save();
    }
  } finally {
    cronRunning = false;
  }
}
