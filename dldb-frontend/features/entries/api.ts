import { api } from "@/lib/api";
import type { CreateEntryInput, EntriesPage, Entry, UpdateEntryInput } from "./schema";

type ListArgs = {
  tagId?: string;
  type?: "task" | "expense" | "note";
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
  search?: string;
};

export const entriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listEntries: build.query<EntriesPage, ListArgs | void>({
      query: (args) => ({ url: "/entries", params: args ?? {} }),
      providesTags: (res) =>
        res
          ? [...res.items.map((e) => ({ type: "Entry" as const, id: e.id })), { type: "Entry" as const, id: "LIST" }]
          : [{ type: "Entry" as const, id: "LIST" }],
    }),
    addEntry: build.mutation<Entry, CreateEntryInput>({
      query: (body) => ({ url: "/entries", method: "POST", body }),
      invalidatesTags: [
        { type: "Entry", id: "LIST" },
        { type: "Dashboard", id: "TODAY" },
        { type: "Goal", id: "GOAL_LIST" },
        { type: "Notification", id: "NOTIFICATION_LIST" },
      ],
    }),
    updateEntry: build.mutation<Entry, { id: string; body: UpdateEntryInput }>({
      query: ({ id, body }) => ({ url: `/entries/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Entry", id },
        { type: "Entry", id: "LIST" },
        { type: "Dashboard", id: "TODAY" },
      ],
    }),
    deleteEntry: build.mutation<void, string>({
      query: (id) => ({ url: `/entries/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Entry", id },
        { type: "Entry", id: "LIST" },
        { type: "Dashboard", id: "TODAY" },
      ],
    }),
    addComment: build.mutation<Entry, { entryId: string; text: string }>({
      query: ({ entryId, text }) => ({ url: `/entries/${entryId}/comments`, method: "POST", body: { text } }),
      invalidatesTags: (_r, _e, { entryId }) => [{ type: "Entry", id: entryId }, { type: "Entry", id: "LIST" }],
    }),
    deleteComment: build.mutation<Entry, { entryId: string; commentId: string }>({
      query: ({ entryId, commentId }) => ({ url: `/entries/${entryId}/comments/${commentId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { entryId }) => [{ type: "Entry", id: entryId }, { type: "Entry", id: "LIST" }],
    }),
    bulkDelete: build.mutation<void, { ids: string[] }>({
      query: (body) => ({ url: "/entries/bulk-delete", method: "POST", body }),
      invalidatesTags: [{ type: "Entry", id: "LIST" }, { type: "Dashboard", id: "TODAY" }],
    }),
    bulkUpdateStatus: build.mutation<void, { ids: string[]; status: "pending" | "done" }>({
      query: (body) => ({ url: "/entries/bulk-status", method: "POST", body }),
      invalidatesTags: [{ type: "Entry", id: "LIST" }, { type: "Dashboard", id: "TODAY" }],
    }),
  }),
});

export const {
  useListEntriesQuery,
  useAddEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useBulkDeleteMutation,
  useBulkUpdateStatusMutation,
} = entriesApi;
