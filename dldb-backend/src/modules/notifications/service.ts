import mongoose from "mongoose";
import { Notification, type NotificationDoc } from "./model.js";
import { Goal } from "../goals/model.js";
import { Tag } from "../tags/model.js";
import { Entry } from "../entries/model.js";
import { getPeriodBounds } from "../../lib/periodBounds.js";

function asObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}

function fmtMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export async function listNotifications(userId: string, limit = 50): Promise<NotificationDoc[]> {
  return Notification.find({ userId: asObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function countUnread(userId: string): Promise<number> {
  return Notification.countDocuments({ userId: asObjectId(userId), read: false });
}

export async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany(
    { userId: asObjectId(userId), read: false },
    { $set: { read: true } },
  );
}

export async function markRead(userId: string, id: string): Promise<void> {
  await Notification.updateOne(
    { _id: asObjectId(id), userId: asObjectId(userId) },
    { $set: { read: true } },
  );
}

async function checkGoalCountNotification(
  userId: string,
  tagId: mongoose.Types.ObjectId,
): Promise<void> {
  const goal = await Goal.findOne({
    userId: asObjectId(userId),
    tagId,
    metric: "count",
    direction: "at_least",
  });
  if (!goal) return;

  const { from, to } = getPeriodBounds(goal.cadence as "weekly" | "monthly");
  const count = await Entry.countDocuments({
    userId: asObjectId(userId),
    tagIds: tagId,
    createdAt: { $gte: from, $lt: to },
  });

  if (count !== goal.target) return;

  const alreadySent = await Notification.exists({
    userId: asObjectId(userId),
    type: "goal_met",
    refId: goal._id,
    createdAt: { $gte: from },
  });
  if (alreadySent) return;

  const tag = await Tag.findById(tagId).lean();
  const cadLabel = goal.cadence === "weekly" ? "this week" : "this month";
  await Notification.create({
    userId: asObjectId(userId),
    type: "goal_met",
    message: `Goal met: ${tag?.name ?? "tag"} reached ${goal.target} ${cadLabel}`,
    refId: goal._id,
  });
}

async function checkBudgetNotification(
  userId: string,
  tagId: mongoose.Types.ObjectId,
): Promise<void> {
  const tag = await Tag.findOne({ _id: tagId, userId: asObjectId(userId) }).lean();
  if (!tag || !tag.budget) return;

  const { from, to } = getPeriodBounds("monthly");
  const agg = await Entry.aggregate([
    {
      $match: {
        userId: asObjectId(userId),
        tagIds: tagId,
        type: "expense",
        createdAt: { $gte: from, $lt: to },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const total: number = agg[0]?.total ?? 0;
  const pct = total / tag.budget;

  if (pct >= 1) {
    const alreadySent = await Notification.exists({
      userId: asObjectId(userId),
      type: "budget_exceeded",
      refId: tagId,
      createdAt: { $gte: from },
    });
    if (!alreadySent) {
      await Notification.create({
        userId: asObjectId(userId),
        type: "budget_exceeded",
        message: `Budget exceeded: ${tag.name} spent ${fmtMoney(total)} of ${fmtMoney(tag.budget)} this month`,
        refId: tagId,
      });
    }
  } else if (pct >= 0.8) {
    const alreadySent = await Notification.exists({
      userId: asObjectId(userId),
      type: "budget_warning",
      refId: tagId,
      createdAt: { $gte: from },
    });
    if (!alreadySent) {
      await Notification.create({
        userId: asObjectId(userId),
        type: "budget_warning",
        message: `Budget warning: ${tag.name} is at ${Math.round(pct * 100)}% of the monthly budget`,
        refId: tagId,
      });
    }
  }
}

export async function triggerNotificationsForNewEntry(
  userId: string,
  tagIds: mongoose.Types.ObjectId[],
  entryType: string | null,
): Promise<void> {
  await Promise.allSettled([
    ...tagIds.map((tagId) => checkGoalCountNotification(userId, tagId)),
    ...(entryType === "expense"
      ? tagIds.map((tagId) => checkBudgetNotification(userId, tagId))
      : []),
  ]);
}
