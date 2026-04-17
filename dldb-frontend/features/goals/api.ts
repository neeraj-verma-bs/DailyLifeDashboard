import { api } from "@/lib/api";
import type { Goal, CreateGoalInput } from "./schema";

export const goalsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGoals: build.query<Goal[], void>({
      query: () => ({ url: "/goals" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Goal" as const, id })),
              { type: "Goal" as const, id: "GOAL_LIST" },
            ]
          : [{ type: "Goal" as const, id: "GOAL_LIST" }],
    }),
    addGoal: build.mutation<Goal, CreateGoalInput>({
      query: (body) => ({ url: "/goals", method: "POST", body }),
      invalidatesTags: [{ type: "Goal", id: "GOAL_LIST" }],
    }),
    deleteGoal: build.mutation<void, string>({
      query: (id) => ({ url: `/goals/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Goal", id },
        { type: "Goal", id: "GOAL_LIST" },
      ],
    }),
  }),
});

export const { useGetGoalsQuery, useAddGoalMutation, useDeleteGoalMutation } = goalsApi;
