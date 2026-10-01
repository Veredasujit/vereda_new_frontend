import { apiSlice } from "../apiSlice";

interface Course {
  id: string;
  title: string;
  courseImageURL: string;
  description: string;
  price: string;
  instructorId: string;
  instructorName: string;
  courseDuration: string;
  status: 'coming_soon' | 'live' | 'expired';
  availableSeat: number;
  courseRatings: number;
  usersLearn: number;
  createdAt: string;
  updatedAt: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalSeat: number;
  batch: string;

}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query<{ success: boolean; courses: Course[] }, void>({
      query: () => ({
        url: "/courses/getAll-courses", // match your backend route
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

// Hooks
export const {
  useGetAllCoursesQuery,
} = userApi;
