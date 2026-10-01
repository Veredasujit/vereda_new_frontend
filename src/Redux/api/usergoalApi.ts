import { apiSlice } from "../apiSlice";

// Types
export interface UserGoalFormData {
  userId: string|undefined;
  goalTitle: string;
  goalDescription?: string;
  targetDate?: string;
  status?: "pending" | "in-progress" | "completed";
}

export interface UserGoal {
  id: string;
  userId: string|undefined;
  goalTitle: string;
  goalDescription?: string | null;
  targetDate?: string | null;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
  length?:number;
}

export interface UserGoalResponse {
  success: boolean;
  message?: string;
  data?: UserGoal | UserGoal[];
}

export const userGoalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Create Goal
    createGoal: builder.mutation<UserGoalResponse, UserGoalFormData>({
      query: (goalData) => ({
        url: "/goals/create-goal",
        method: "POST",
        body: goalData,
      }),
    }),

    // Get All Goals For a User
    getUserGoals: builder.query<UserGoalResponse, string>({
      query: (userId) => ({
        url: `/goals/user/${userId}`,
        method: "GET",
      }),
    }),

    // Get Single Goal by ID
    getGoalById: builder.query<UserGoalResponse, string>({
      query: (goalId) => ({
        url: `/goals/${goalId}`,
        method: "GET",
      }),
    }),

    // Update Goal
    updateGoal: builder.mutation<
      UserGoalResponse,
      { id: string; updatedData: Partial<UserGoalFormData> }
    >({
      query: ({ id, updatedData }) => ({
        url: `/goals/${id}`,
        method: "PUT",
        body: updatedData,
      }),
    }),

    // Delete Goal
    deleteGoal: builder.mutation<UserGoalResponse, string>({
      query: (goalId) => ({
        url: `/goals/${goalId}`,
        method: "DELETE",
      }),
    }),

  }),

  overrideExisting: false,
});

// Hooks
export const {
  useCreateGoalMutation,
  useGetUserGoalsQuery,
  useGetGoalByIdQuery,
  useUpdateGoalMutation,
  useDeleteGoalMutation
} = userGoalApi;
