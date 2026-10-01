import { apiSlice } from "../apiSlice";

export const billingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all payments or billing info for a specific user or ID
    getPaymentsByUserId: builder.query({
      query: (id) => ({
        url: `/payments/${id}`, // matches your backend route
        method: "GET",
      }),
      // Optional: transform response if backend wraps data
      transformResponse: (response) => response.payments || response,
    }),
  }),
  overrideExisting: false,
});

// Export the hook
export const { useGetPaymentsByUserIdQuery } = billingApi;
