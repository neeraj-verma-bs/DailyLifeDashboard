import mongoose from "mongoose";
import { Entry, type EntryDoc } from "./model.js";
import { Tag, type TagDoc } from "../tags/model.js";
import type { AddCommentInput, BulkDeleteInput, BulkStatusInput, CreateEntryInput, ExportQuery, ListEntriesQuery, UpdateEntryInput } from "./schema.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import { triggerNotificationsForNewEntry } from "../notifications/service.js";

type DerivedType = "task" | "expense" | "note" | null;

function asObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function deriveType(primaryTag: TagDoc): DerivedType {
  switch (primaryTag.name) {
    case "Task": return "task";
    case "Expense": return "expense";
    case "Note": return "note";
    default: return null;
  }
}

async function loadPrimaryTag(userId: mongoose.Types.ObjectId, tagIds: string[]): Promise<TagDoc> {
  const primaryId = asObjectId(tagIds[0]!);
  const primary = await Tag.findOne({ _id: primaryId, userId });
  if (!primary) throw new ValidationError({ tagIds: ["First tag not found"] }, "Primary tag not found");
  if (tagIds.length > 1) {
    const rest = tagIds.slice(1).map(asObjectId);
    const count = await Tag.countDocuments({ _id: { $in: rest }, userId });
    if (count !== rest.length) {
      throw new ValidationError({ tagIds: ["One or more tags not found"] }, "Invalid tagIds");
    }
  }
  return primary;
}

type Shaped = {
  type: DerivedType;
  amount: number | null;
  status: "pending" | "done" | null;
  dueDate: Date | null;
};

function enforceConditionalShape(
  type: DerivedType,
  raw: { amount?: number | null; status?: "pending" | "done" | null; dueDate?: Date | null },
): Shaped {
  const amount = raw.amount ?? null;
  const status = raw.status ?? null;
  const dueDate = raw.dueDate ?? null;

  if (type === "expense") {
    if (amount === null) throw new ValidationError({ amount: ["Required for expense"] });
    if (status !== null) throw new ValidationError({ status: ["Not allowed for expense"] });
    if (dueDate !== null) throw new ValidationError({ dueDate: ["Not allowed for expense"] });
    return { type, amount, status: null, dueDate: null };
  }
  if (type === "task") {
    if (amount !== null) throw new ValidationError({ amount: ["Not allowed for task"] });
    return { type, amount: null, status: status ?? "pending", dueDate };
  }
  if (type === "note") {
    if (amount !== null) throw new ValidationError({ amount: ["Not allowed for note"] });
    if (status !== null) throw new ValidationError({ status: ["Not allowed for note"] });
    if (dueDate !== null) throw new ValidationError({ dueDate: ["Not allowed for note"] });
    return { type, amount: null, status: null, dueDate: null };
  }
  if (amount !== null) throw new ValidationError({ amount: ["Not allowed for untyped entry"] });
  if (status !== null) throw new ValidationError({ status: ["Not allowed for untyped entry"] });
  if (dueDate !== null) throw new ValidationError({ dueDate: ["Not allowed for untyped entry"] });
  return { type: null, amount: null, status: null, dueDate: null };
}

export async function createEntry(userId: string, input: CreateEntryInput): Promise<EntryDoc> {
  const userObj = asObjectId(userId);
  const primary = await loadPrimaryTag(userObj, input.tagIds);
  const type = deriveType(primary);
  const shape = enforceConditionalShape(type, input);
  const entry = await Entry.create({
    userId: userObj,
    content: input.content,
    tagIds: input.tagIds.map(asObjectId),
    ...shape,
  });
  void triggerNotificationsForNewEntry(
    userId,
    entry.tagIds as mongoose.Types.ObjectId[],
    entry.type ?? null,
  ).catch(console.error);
  return entry;
}

export async function updateEntry(userId: string, id: string, input: UpdateEntryInput): Promise<EntryDoc> {
  const userObj = asObjectId(userId);
  const entry = await Entry.findOne({ _id: asObjectId(id), userId: userObj });
  if (!entry) throw new NotFoundError("Entry not found", "ENTRY_NOT_FOUND");

  const mergedTagIds = (input.tagIds ?? entry.tagIds.map((x) => x.toString())) as string[];
  const primary = await loadPrimaryTag(userObj, mergedTagIds);
  const type = deriveType(primary);

  const merged = {
    amount: input.amount !== undefined ? input.amount : entry.amount,
    status: input.status !== undefined ? (input.status as "pending" | "done" | null) : (entry.status as "pending" | "done" | null),
    dueDate: input.dueDate !== undefined ? input.dueDate : entry.dueDate,
  };
  const shape = enforceConditionalShape(type, merged);

  if (input.content !== undefined) entry.content = input.content;
  if (input.pinned !== undefined) entry.pinned = input.pinned;
  entry.tagIds = mergedTagIds.map(asObjectId) as unknown as typeof entry.tagIds;
  entry.type = shape.type;
  entry.amount = shape.amount;
  entry.status = shape.status;
  entry.dueDate = shape.dueDate;
  await entry.save();
  return entry;
}

export async function deleteEntry(userId: string, id: string): Promise<void> {
  const res = await Entry.deleteOne({ _id: asObjectId(id), userId: asObjectId(userId) });
  if (res.deletedCount === 0) throw new NotFoundError("Entry not found", "ENTRY_NOT_FOUND");
}

export async function listEntries(
  userId: string,
  q: ListEntriesQuery,
): Promise<{ items: EntryDoc[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { userId: asObjectId(userId) };
  if (q.tagId) filter.tagIds = asObjectId(q.tagId);
  if (q.type) filter.type = q.type;
  if (q.from || q.to) {
    filter.createdAt = {
      ...(q.from ? { $gte: q.from } : {}),
      ...(q.to ? { $lte: q.to } : {}),
    };
  }
  if (q.cursor) {
    const cursorDate = new Date(q.cursor);
    if (Number.isNaN(cursorDate.getTime())) {
      throw new ValidationError({ cursor: ["Invalid cursor"] });
    }
    filter.createdAt = { ...(filter.createdAt as object), $lt: cursorDate };
  }
  if (q.search) {
    filter.$text = { $search: q.search };
  }

  const items = await Entry.find(filter).sort({ pinned: -1, createdAt: -1 }).limit(q.limit + 1);
  const hasMore = items.length > q.limit;
  const page = hasMore ? items.slice(0, q.limit) : items;
  const nextCursor = hasMore ? (page[page.length - 1] as unknown as { createdAt: Date }).createdAt.toISOString() : null;
  return { items: page, nextCursor };
}

export async function addComment(userId: string, entryId: string, text: string): Promise<EntryDoc> {
  const entry = await Entry.findOne({ _id: asObjectId(entryId), userId: asObjectId(userId) });
  if (!entry) throw new NotFoundError("Entry not found", "ENTRY_NOT_FOUND");
  (entry.comments as unknown as Array<{ text: string }>).push({ text });
  await entry.save();
  return entry;
}

export async function deleteComment(userId: string, entryId: string, commentId: string): Promise<EntryDoc> {
  const entry = await Entry.findOne({ _id: asObjectId(entryId), userId: asObjectId(userId) });
  if (!entry) throw new NotFoundError("Entry not found", "ENTRY_NOT_FOUND");
  const comments = entry.comments as unknown as Array<{ _id: { toString(): string } }>;
  const idx = comments.findIndex((c) => c._id.toString() === commentId);
  if (idx === -1) throw new NotFoundError("Comment not found", "COMMENT_NOT_FOUND");
  comments.splice(idx, 1);
  await entry.save();
  return entry;
}

export async function bulkDelete(userId: string, ids: string[]): Promise<void> {
  await Entry.deleteMany({ _id: { $in: ids.map(asObjectId) }, userId: asObjectId(userId) });
}

export async function bulkUpdateStatus(userId: string, ids: string[], status: "pending" | "done"): Promise<void> {
  await Entry.updateMany(
    { _id: { $in: ids.map(asObjectId) }, userId: asObjectId(userId), type: "task" },
    { $set: { status } },
  );
}

export async function exportEntries(
  userId: string,
  q: ExportQuery,
): Promise<EntryDoc[]> {
  const filter: Record<string, unknown> = { userId: asObjectId(userId) };
  if (q.tagId) filter.tagIds = asObjectId(q.tagId);
  if (q.type) filter.type = q.type;
  if (q.from || q.to) {
    filter.createdAt = {
      ...(q.from ? { $gte: q.from } : {}),
      ...(q.to ? { $lte: q.to } : {}),
    };
  }
  return Entry.find(filter).sort({ createdAt: -1 }).limit(10_000);
}
