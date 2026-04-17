import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["goal_met", "budget_warning", "budget_exceeded"],
      required: true,
    },
    message: { type: String, required: true, maxlength: 500 },
    read: { type: Boolean, default: false },
    refId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, versionKey: false },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    delete ret._id;
    ret.userId = ret.userId?.toString();
    if (ret.refId) ret.refId = (ret.refId as mongoose.Types.ObjectId).toString();
    return ret;
  },
});

export type NotificationDoc = InferSchemaType<typeof notificationSchema> &
  mongoose.Document & { _id: mongoose.Types.ObjectId };

export const Notification: Model<NotificationDoc> =
  mongoose.models.Notification ??
  mongoose.model<NotificationDoc>("Notification", notificationSchema);
