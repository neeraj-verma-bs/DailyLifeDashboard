import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    metric: { type: String, enum: ["count", "amount"], required: true },
    direction: { type: String, enum: ["at_least", "at_most"], required: true },
    target: { type: Number, required: true, min: 1 },
    cadence: { type: String, enum: ["weekly", "monthly"], required: true },
  },
  { timestamps: true, versionKey: false },
);

goalSchema.index({ userId: 1, tagId: 1 }, { unique: true });

goalSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    delete ret._id;
    ret.userId = ret.userId?.toString();
    ret.tagId = ret.tagId?.toString();
    return ret;
  },
});

export type GoalDoc = InferSchemaType<typeof goalSchema> &
  mongoose.Document & { _id: mongoose.Types.ObjectId };

export const Goal: Model<GoalDoc> =
  mongoose.models.Goal ?? mongoose.model<GoalDoc>("Goal", goalSchema);
