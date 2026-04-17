import type mongoose from "mongoose";
import { SYSTEM_TAG_COLORS, SYSTEM_TAG_NAMES, Tag } from "./model.js";

export async function seedSystemTags(userId: mongoose.Types.ObjectId): Promise<void> {
  const docs = SYSTEM_TAG_NAMES.map((name) => ({
    userId,
    name,
    color: SYSTEM_TAG_COLORS[name],
    isSystem: true,
  }));
  await Tag.insertMany(docs, { ordered: true });
}
