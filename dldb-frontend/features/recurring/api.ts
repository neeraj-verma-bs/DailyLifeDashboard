import { api } from "@/lib/api";
import type { CreateRecurringInput, RecurringEntry } from "./schema";

export const recurringApi = api.injectEndpoints({
  endpoints: (build) => ({
    listRecurring: build.query<RecurringEntry[], void>({
      query: () => "/recurring",
      providesTags: [{ type: "Entry" as const, id: "RECURRING" }],
    }),
    addRecurring: build.mutation<RecurringEntry, CreateRecurringInput>({
      query: (body) => ({ url: "/recurring", method: "POST", body }),
      invalidatesTags: [{ type: "Entry", id: "RECURRING" }],
    }),
    toggleRecurring: build.mutation<RecurringEntry, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/recurring/${id}`, method: "PATCH", body: { isActive } }),
      invalidatesTags: [{ type: "Entry", id: "RECURRING" }],
    }),
    deleteRecurring: build.mutation<void, string>({
      query: (id) => ({ url: `/recurring/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Entry", id: "RECURRING" }],
    }),
  }),
});

export const {
  useListRecurringQuery,
  useAddRecurringMutation,
  useToggleRecurringMutation,
  useDeleteRecurringMutation,
} = recurringApi;
