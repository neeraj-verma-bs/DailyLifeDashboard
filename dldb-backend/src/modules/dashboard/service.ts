import mongoose from "mongoose";
import { Entry, type EntryDoc } from "../entries/model.js";

export type TodayDashboard = {
  summary: {
    tasksDone: number;
    tasksPending: number;
    totalSpent: number;
    entriesCount: number;
  };
  recentEntries: EntryDoc[];
};

function utcDayBounds(now = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getTodayDashboard(userId: string): Promise<TodayDashboard> {
  const userObj = new mongoose.Types.ObjectId(userId);
  const { start, end } = utcDayBounds();
  const filter = { userId: userObj, createdAt: { $gte: start, $lt: end } };

  const [agg, recent] = await Promise.all([
    Entry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          entriesCount: { $sum: 1 },
          totalSpent: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $ifNull: ["$amount", 0] }, 0] },
          },
          tasksDone: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "task"] }, { $eq: ["$status", "done"] }] }, 1, 0] },
          },
          tasksPending: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "task"] }, { $eq: ["$status", "pending"] }] }, 1, 0] },
          },
        },
      },
    ]),
    Entry.find(filter).sort({ createdAt: -1 }).limit(10),
  ]);

  const summary = agg[0] ?? { entriesCount: 0, totalSpent: 0, tasksDone: 0, tasksPending: 0 };
  return {
    summary: {
      tasksDone: summary.tasksDone ?? 0,
      tasksPending: summary.tasksPending ?? 0,
      totalSpent: summary.totalSpent ?? 0,
      entriesCount: summary.entriesCount ?? 0,
    },
    recentEntries: recent,
  };
}

export type SpendByTag = { tagId: string; total: number };
export type DailyPoint = { date: string; count: number; done: number; pending: number };

export type RangeDashboard = {
  summary: {
    tasksDone: number;
    tasksPending: number;
    totalSpent: number;
    entriesCount: number;
  };
  spendByTag: SpendByTag[];
  dailySeries: DailyPoint[];
};

export async function getRangeDashboard(
  userId: string,
  from: Date,
  to: Date,
): Promise<RangeDashboard> {
  const userObj = new mongoose.Types.ObjectId(userId);
  const filter = { userId: userObj, createdAt: { $gte: from, $lt: to } };

  const [summaryAgg, spendAgg, dailyAgg] = await Promise.all([
    Entry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          entriesCount: { $sum: 1 },
          totalSpent: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $ifNull: ["$amount", 0] }, 0] },
          },
          tasksDone: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "task"] }, { $eq: ["$status", "done"] }] }, 1, 0] },
          },
          tasksPending: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "task"] }, { $eq: ["$status", "pending"] }] }, 1, 0] },
          },
        },
      },
    ]),
    Entry.aggregate([
      { $match: { ...filter, type: "expense" } },
      {
        $group: {
          _id: { $arrayElemAt: ["$tagIds", 0] },
          total: { $sum: "$amount" },
        },
      },
    ]),
    Entry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          done: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "task"] }, { $eq: ["$status", "done"] }] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "task"] }, { $eq: ["$status", "pending"] }] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const s = summaryAgg[0] ?? { entriesCount: 0, totalSpent: 0, tasksDone: 0, tasksPending: 0 };

  return {
    summary: {
      tasksDone: s.tasksDone ?? 0,
      tasksPending: s.tasksPending ?? 0,
      totalSpent: s.totalSpent ?? 0,
      entriesCount: s.entriesCount ?? 0,
    },
    spendByTag: spendAgg.map((x: { _id: mongoose.Types.ObjectId; total: number }) => ({
      tagId: x._id?.toString() ?? "",
      total: x.total ?? 0,
    })),
    dailySeries: dailyAgg.map((x: { _id: string; count: number; done: number; pending: number }) => ({
      date: x._id,
      count: x.count,
      done: x.done,
      pending: x.pending,
    })),
  };
}
