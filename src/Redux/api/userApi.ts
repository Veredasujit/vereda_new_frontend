import { apiSlice } from "../apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Update User (PUT request)
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

  }),

  overrideExisting: false,
});

// Export Hooks
export const {
  useUpdateUserMutation,
} = userApi;
