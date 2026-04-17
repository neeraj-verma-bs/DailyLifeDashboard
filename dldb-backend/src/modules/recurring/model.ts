import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const recurringEntrySchema = new Schema(
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
    amount: { type: Number, default: null },
    cadence: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    nextDueAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

recurringEntrySchema.index({ nextDueAt: 1, isActive: 1 });

recurringEntrySchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    delete ret._id;
    ret.userId = ret.userId?.toString();
    ret.tagIds = Array.isArray(ret.tagIds)
      ? ret.tagIds.map((x: unknown) => (x as mongoose.Types.ObjectId)?.toString?.() ?? x)
      : ret.tagIds;
    return ret;
  },
});

export type RecurringEntryDoc = InferSchemaType<typeof recurringEntrySchema> &
  mongoose.Document & { _id: mongoose.Types.ObjectId };

export const RecurringEntry: Model<RecurringEntryDoc> =
  mongoose.models.RecurringEntry ??
  mongoose.model<RecurringEntryDoc>("RecurringEntry", recurringEntrySchema);
