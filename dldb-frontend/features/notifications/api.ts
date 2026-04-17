import { api } from "@/lib/api";
import type { NotificationsResponse } from "./schema";

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationsResponse, void>({
      query: () => ({ url: "/notifications" }),
      providesTags: [{ type: "Notification", id: "NOTIFICATION_LIST" }],
    }),
    markAllRead: build.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "NOTIFICATION_LIST" }],
    }),
    markRead: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "NOTIFICATION_LIST" }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} = notificationsApi;
