import { apiSlice } from "../apiSlice";

export const enrollmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEnrollmentById: builder.query({
      query: (id) => ({
        url: `/enrollments/${id}`, 
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

// Hook
export const { useGetEnrollmentByIdQuery } = enrollmentApi;
