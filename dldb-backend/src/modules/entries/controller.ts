import type { RequestHandler } from "express";
import { getValidated } from "../../middleware/validate.js";
import type { AddCommentInput, BulkDeleteInput, BulkStatusInput, CreateEntryInput, ExportQuery, ListEntriesQuery, UpdateEntryInput } from "./schema.js";
import { addComment, bulkDelete, bulkUpdateStatus, createEntry, deleteComment, deleteEntry, exportEntries, listEntries, updateEntry } from "./service.js";

export const postEntry: RequestHandler = async (req, res) => {
  const input = getValidated<CreateEntryInput>(req);
  const entry = await createEntry(req.user!.id, input);
  res.status(201).json(entry.toJSON());
};

export const getEntries: RequestHandler = async (req, res) => {
  const q = getValidated<ListEntriesQuery>(req);
  const { items, nextCursor } = await listEntries(req.user!.id, q);
  res.json({ items: items.map((e) => e.toJSON()), nextCursor });
};

export const patchEntry: RequestHandler = async (req, res) => {
  const input = getValidated<UpdateEntryInput>(req);
  const entry = await updateEntry(req.user!.id, req.params.id as string, input);
  res.json(entry.toJSON());
};

export const removeEntry: RequestHandler = async (req, res) => {
  await deleteEntry(req.user!.id, req.params.id as string);
  res.status(204).end();
};

export const postComment: RequestHandler = async (req, res) => {
  const { text } = getValidated<AddCommentInput>(req);
  const entry = await addComment(req.user!.id, req.params.id as string, text);
  res.status(201).json(entry.toJSON());
};

export const removeComment: RequestHandler = async (req, res) => {
  const entry = await deleteComment(req.user!.id, req.params.id as string, req.params.cid as string);
  res.json(entry.toJSON());
};

export const bulkRemove: RequestHandler = async (req, res) => {
  const { ids } = getValidated<BulkDeleteInput>(req);
  await bulkDelete(req.user!.id, ids);
  res.status(204).end();
};

export const bulkPatchStatus: RequestHandler = async (req, res) => {
  const { ids, status } = getValidated<BulkStatusInput>(req);
  await bulkUpdateStatus(req.user!.id, ids, status);
  res.status(204).end();
};

export const exportHandler: RequestHandler = async (req, res) => {
  const q = getValidated<ExportQuery>(req);
  const entries = await exportEntries(req.user!.id, q);

  if (q.format === "json") {
    res.setHeader("Content-Disposition", 'attachment; filename="entries.json"');
    res.setHeader("Content-Type", "application/json");
    return res.json(entries.map((e) => e.toJSON()));
  }

  // CSV
  const header = "id,content,type,amount,status,dueDate,tags,createdAt";
  const rows = entries.map((e) => {
    const j = e.toJSON() as Record<string, unknown>;
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return [
      escape(j.id),
      escape(j.content),
      escape(j.type ?? ""),
      escape(j.amount ?? ""),
      escape(j.status ?? ""),
      escape(j.dueDate ?? ""),
      escape(Array.isArray(j.tagIds) ? (j.tagIds as string[]).join(";") : ""),
      escape(j.createdAt),
    ].join(",");
  });

  res.setHeader("Content-Disposition", 'attachment; filename="entries.csv"');
  res.setHeader("Content-Type", "text/csv");
  res.send([header, ...rows].join("\n"));
};
