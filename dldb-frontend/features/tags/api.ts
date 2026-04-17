import { api } from "@/lib/api";
import type { CreateTagInput, Tag, UpdateTagInput } from "./schema";

export const tagsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTags: build.query<Tag[], void>({
      query: () => ({ url: "/tags" }),
      providesTags: (res) =>
        res
          ? [...res.map((t) => ({ type: "Tag" as const, id: t.id })), { type: "Tag" as const, id: "LIST" }]
          : [{ type: "Tag" as const, id: "LIST" }],
    }),
    addTag: build.mutation<Tag, CreateTagInput>({
      query: (body) => ({ url: "/tags", method: "POST", body }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),
    updateTag: build.mutation<Tag, { id: string; body: UpdateTagInput }>({
      query: ({ id, body }) => ({ url: `/tags/${id}`, method: "PATCH", body }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Tag", id },
        { type: "Tag", id: "LIST" },
        { type: "Entry", id: "LIST" },
      ],
    }),
    deleteTag: build.mutation<void, string>({
      query: (id) => ({ url: `/tags/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Tag", id },
        { type: "Tag", id: "LIST" },
        { type: "Entry", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetTagsQuery, useAddTagMutation, useUpdateTagMutation, useDeleteTagMutation } = tagsApi;
