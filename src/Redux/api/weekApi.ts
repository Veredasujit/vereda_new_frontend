import { apiSlice } from "../apiSlice";

// Define expected response types
export interface WeekResult {
  id: string;
  enrollmentId: string;
  weekNumber: number;
  weekStatus: string;
  weekMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeekResultResponse {
  message: string;
  enrollments: number;
  data: WeekResult[];
}

// Inject new endpoints into apiSlice
export const weekApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all weekly test results
    getWeeklyResults: builder.query<WeekResultResponse, void>({
      query: () => ({
        url: "/week-data/test-result",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

// Hooks
export const { useGetWeeklyResultsQuery } = weekApi;