import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const entrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    tagIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
      required: true,
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.length > 0,
        message: "At least one tag is required",
      },
    },
    type: { type: String, enum: ["task", "expense", "note", null], default: null },
    amount: { type: Number, default: null },
    status: { type: String, enum: ["pending", "done", null], default: null },
    dueDate: { type: Date, default: null },
    pinned: { type: Boolean, default: false },
    comments: {
      type: [
        new Schema(
          { text: { type: String, required: true, trim: true, maxlength: 500 } },
          { _id: true, timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

entrySchema.index({ userId: 1, createdAt: -1 });
entrySchema.index({ userId: 1, tagIds: 1 });
entrySchema.index({ userId: 1, content: "text" });

entrySchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    delete ret._id;
    ret.userId = ret.userId?.toString();
    ret.tagIds = Array.isArray(ret.tagIds)
      ? ret.tagIds.map((x: unknown) => (x as mongoose.Types.ObjectId)?.toString?.() ?? x)
      : ret.tagIds;
    if (Array.isArray(ret.comments)) {
      ret.comments = (ret.comments as Array<Record<string, unknown>>).map((c) => {
        const id = (c._id as mongoose.Types.ObjectId)?.toString();
        const { _id: _removed, ...rest } = c;
        return { id, ...rest };
      });
    }
    return ret;
  },
});

export type EntryDoc = InferSchemaType<typeof entrySchema> & mongoose.Document & { _id: mongoose.Types.ObjectId };

export const Entry: Model<EntryDoc> =
  mongoose.models.Entry ?? mongoose.model<EntryDoc>("Entry", entrySchema);
