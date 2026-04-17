import { api } from "@/lib/api";
import type { AuthUser } from "./authSlice";
import { setUser } from "@/features/auth/authSlice";
import type { LoginInput, RegisterInput } from "./schema";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    me: build.query<AuthUser, void>({
      query: () => ({ url: "/auth/me" }),
      transformResponse: (res: { user: AuthUser }) => res.user,
      providesTags: ["User"],
    }),
    login: build.mutation<AuthUser, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (res: { user: AuthUser }) => res.user,
      invalidatesTags: ["User", "Tag", "Entry", "Dashboard"],
    }),
    register: build.mutation<AuthUser, RegisterInput>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (res: { user: AuthUser }) => res.user,
      invalidatesTags: ["User", "Tag", "Entry", "Dashboard"],
    }),
    logout: build.mutation<{ ok: true }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User", "Tag", "Entry", "Dashboard"],
    }),
    updateMe: build.mutation<AuthUser, { name?: string; email?: string }>({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      invalidatesTags: [{ type: "User" as const, id: "ME" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
    }),
    changePassword: build.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/me/password", method: "PATCH", body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = authApi;
