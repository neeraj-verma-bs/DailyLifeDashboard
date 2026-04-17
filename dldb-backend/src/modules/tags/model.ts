import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const tagSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 64 },
    color: { type: String, required: true, match: /^#([0-9a-fA-F]{6})$/ },
    isSystem: { type: Boolean, default: false },
    budget: { type: Number, default: null },
    group: { type: String, trim: true, maxlength: 64, default: null },
  },
  { timestamps: true, versionKey: false },
);

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

tagSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    delete ret._id;
    ret.userId = ret.userId?.toString();
    return ret;
  },
});

export type TagDoc = InferSchemaType<typeof tagSchema> & mongoose.Document & { _id: mongoose.Types.ObjectId };

export const Tag: Model<TagDoc> =
  mongoose.models.Tag ?? mongoose.model<TagDoc>("Tag", tagSchema);

export const SYSTEM_TAG_NAMES = ["Task", "Expense", "Note"] as const;
export type SystemTagName = (typeof SYSTEM_TAG_NAMES)[number];

export const SYSTEM_TAG_COLORS: Record<SystemTagName, string> = {
  Task: "#3B82F6",
  Expense: "#22C55E",
  Note: "#9CA3AF",
};
