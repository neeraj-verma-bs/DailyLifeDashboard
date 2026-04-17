import type { RequestHandler } from "express";
import { getValidated } from "../../middleware/validate.js";
import type { CreateRecurringInput, UpdateRecurringInput } from "./schema.js";
import { createRecurring, deleteRecurring, listRecurring, updateRecurring } from "./service.js";

export const getRecurring: RequestHandler = async (req, res) => {
  const items = await listRecurring(req.user!.id);
  res.json(items.map((r) => r.toJSON()));
};

export const postRecurring: RequestHandler = async (req, res) => {
  const input = getValidated<CreateRecurringInput>(req);
  const rec = await createRecurring(req.user!.id, input);
  res.status(201).json(rec.toJSON());
};

export const patchRecurring: RequestHandler = async (req, res) => {
  const input = getValidated<UpdateRecurringInput>(req);
  const rec = await updateRecurring(req.user!.id, req.params.id as string, input);
  res.json(rec.toJSON());
};

export const removeRecurring: RequestHandler = async (req, res) => {
  await deleteRecurring(req.user!.id, req.params.id as string);
  res.status(204).end();
};
