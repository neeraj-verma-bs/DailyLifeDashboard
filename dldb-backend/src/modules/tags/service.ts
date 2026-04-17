import mongoose from "mongoose";
import type { CreateTagInput, UpdateTagInput } from "./schema.js";
import { Tag, type TagDoc } from "./model.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { Entry } from "../entries/model.js";

function asObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

export async function listTags(userId: string): Promise<TagDoc[]> {
  return Tag.find({ userId: asObjectId(userId) }).sort({ isSystem: -1, name: 1 });
}

export async function createTag(userId: string, input: CreateTagInput): Promise<TagDoc> {
  try {
    return await Tag.create({
      userId: asObjectId(userId),
      name: input.name,
      color: input.color,
      group: input.group ?? null,
      isSystem: false,
    });
  } catch (err: unknown) {
    if ((err as { code?: number })?.code === 11000) {
      throw new ConflictError("A tag with that name already exists", "TAG_NAME_TAKEN");
    }
    throw err;
  }
}

export async function updateTag(userId: string, id: string, input: UpdateTagInput): Promise<TagDoc> {
  const tag = await Tag.findOne({ _id: asObjectId(id), userId: asObjectId(userId) });
  if (!tag) throw new NotFoundError("Tag not found", "TAG_NOT_FOUND");
  if (input.name !== undefined) tag.name = input.name;
  if (input.color !== undefined) tag.color = input.color;
  if (input.budget !== undefined) tag.budget = input.budget;
  if (input.group !== undefined) tag.group = input.group;
  try {
    await tag.save();
  } catch (err: unknown) {
    if ((err as { code?: number })?.code === 11000) {
      throw new ConflictError("A tag with that name already exists", "TAG_NAME_TAKEN");
    }
    throw err;
  }
  return tag;
}

export async function deleteTag(userId: string, id: string): Promise<void> {
  const tag = await Tag.findOne({ _id: asObjectId(id), userId: asObjectId(userId) });
  if (!tag) throw new NotFoundError("Tag not found", "TAG_NOT_FOUND");
  if (tag.isSystem) {
    throw new ForbiddenError("System tags cannot be deleted", "SYSTEM_TAG_PROTECTED");
  }
  const inUse = await Entry.exists({ userId: asObjectId(userId), tagIds: tag._id });
  if (inUse) {
    throw new ConflictError("Tag is still used by one or more entries", "TAG_IN_USE");
  }
  await tag.deleteOne();
}
