import mongoose from "mongoose";
import { Entry } from "../entries/model.js";
import { Goal, type GoalDoc } from "./model.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { getPeriodBounds } from "../../lib/periodBounds.js";
import type { CreateGoalInput } from "./schema.js";

function asObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

export type GoalWithProgress = {
  id: string;
  userId: string;
  tagId: string;
  metric: "count" | "amount";
  direction: "at_least" | "at_most";
  target: number;
  cadence: "weekly" | "monthly";
  current: number;
  pct: number;
  met: boolean;
  createdAt: Date;
  updatedAt: Date;
};

async function computeProgress(
  userId: string,
  goal: GoalDoc,
): Promise<{ current: number; pct: number; met: boolean }> {
  const { from, to } = getPeriodBounds(goal.cadence as "weekly" | "monthly");
  const filter = {
    userId: asObjectId(userId),
    tagIds: asObjectId(goal.tagId.toString()),
    createdAt: { $gte: from, $lt: to },
  };

  let current = 0;
  if (goal.metric === "count") {
    current = await Entry.countDocuments(filter);
  } else {
    const agg = await Entry.aggregate([
      { $match: { ...filter, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    current = agg[0]?.total ?? 0;
  }

  const pct = Math.min(100, Math.round((current / goal.target) * 100));
  const met = goal.direction === "at_least" ? current >= goal.target : current <= goal.target;
  return { current, pct, met };
}

export async function listGoalsWithProgress(userId: string): Promise<GoalWithProgress[]> {
  const goals = await Goal.find({ userId: asObjectId(userId) });
  return Promise.all(
    goals.map(async (goal) => {
      const { current, pct, met } = await computeProgress(userId, goal);
      const j = goal.toJSON() as unknown as Record<string, unknown>;
      return {
        id: j.id as string,
        userId: j.userId as string,
        tagId: j.tagId as string,
        metric: goal.metric as "count" | "amount",
        direction: goal.direction as "at_least" | "at_most",
        target: goal.target,
        cadence: goal.cadence as "weekly" | "monthly",
        current,
        pct,
        met,
        createdAt: goal.createdAt as Date,
        updatedAt: goal.updatedAt as Date,
      };
    }),
  );
}

export async function createGoal(userId: string, input: CreateGoalInput): Promise<GoalDoc> {
  try {
    return await Goal.create({
      userId: asObjectId(userId),
      tagId: asObjectId(input.tagId),
      metric: input.metric,
      direction: input.direction,
      target: input.target,
      cadence: input.cadence,
    });
  } catch (err: unknown) {
    if ((err as { code?: number })?.code === 11000) {
      throw new ConflictError("A goal for this tag already exists", "GOAL_TAG_TAKEN");
    }
    throw err;
  }
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  const goal = await Goal.findOne({ _id: asObjectId(id), userId: asObjectId(userId) });
  if (!goal) throw new NotFoundError("Goal not found", "GOAL_NOT_FOUND");
  await goal.deleteOne();
}
