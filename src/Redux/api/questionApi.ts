import { apiSlice } from "../apiSlice";
export interface Question {
  id: string;
  setNo: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Question API
export const questionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all questions (filterable by courseId and setNo)
    getAllQuestions: builder.mutation<
      { success: boolean; total: number; questions: Question[] },
      { courseId?: string; setNo?: number }
    >({
      query: (filters) => ({
        url: "/admin/questions/list",
        method: "POST",
        body: filters,
      }),
    }),
  }),
  overrideExisting: false,
});

// Weekly Progress API
export const weeklyProgressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all weekly progress records for the logged-in user
    getAllWeeklyProgressForUser: builder.query({
      query: () => ({
        url: "/week-data/test-result",
        method: "GET",
      }),
    }),

    // Update or create a weekly progress record
    updateWeeklyProgressForUser: builder.mutation({
      query: (body) => ({
        url: "/week-data/update",
        method: "PUT",
        body, // expects { weekNumber, weekMarks, weekStatus }
      }),
    }),
  }),
  overrideExisting: false,
});

// Export hooks from both APIs
export const { useGetAllQuestionsMutation } = questionApi;

export const {
  useGetAllWeeklyProgressForUserQuery,
  useUpdateWeeklyProgressForUserMutation,
} = weeklyProgressApi;