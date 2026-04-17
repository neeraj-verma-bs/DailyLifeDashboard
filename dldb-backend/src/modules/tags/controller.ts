import type { RequestHandler } from "express";
import { getValidated } from "../../middleware/validate.js";
import type { CreateTagInput, UpdateTagInput } from "./schema.js";
import { createTag, deleteTag, listTags, updateTag } from "./service.js";

export const getTags: RequestHandler = async (req, res) => {
  const tags = await listTags(req.user!.id);
  res.json(tags.map((t) => t.toJSON()));
};

export const postTag: RequestHandler = async (req, res) => {
  const input = getValidated<CreateTagInput>(req);
  const tag = await createTag(req.user!.id, input);
  res.status(201).json(tag.toJSON());
};

export const patchTag: RequestHandler = async (req, res) => {
  const input = getValidated<UpdateTagInput>(req);
  const tag = await updateTag(req.user!.id, req.params.id as string, input);
  res.json(tag.toJSON());
};

export const removeTag: RequestHandler = async (req, res) => {
  await deleteTag(req.user!.id, req.params.id as string);
  res.status(204).end();
};
