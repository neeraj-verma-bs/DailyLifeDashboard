import { api } from "@/lib/api";
import type { Entry } from "@/features/entries/schema";

export type TodaySummary = {
  tasksDone: number;
  tasksPending: number;
  totalSpent: number;
  entriesCount: number;
};

export type TodayResponse = {
  summary: TodaySummary;
  recentEntries: Entry[];
};

export type SpendByTag = { tagId: string; total: number };
export type DailyPoint = { date: string; count: number; done: number; pending: number };

export type RangeResponse = {
  summary: TodaySummary;
  spendByTag: SpendByTag[];
  dailySeries: DailyPoint[];
};

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getToday: build.query<TodayResponse, void>({
      query: () => ({ url: "/dashboard/today" }),
      providesTags: [{ type: "Dashboard", id: "TODAY" }],
    }),
    getRange: build.query<RangeResponse, { from: string; to: string }>({
      query: ({ from, to }) => ({ url: "/dashboard/range", params: { from, to } }),
      providesTags: [{ type: "Dashboard", id: "RANGE" }],
    }),
  }),
});

export const { useGetTodayQuery, useGetRangeQuery } = dashboardApi;
