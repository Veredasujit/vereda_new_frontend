import { apiSlice } from "../apiSlice";

// Define the data structures
export interface LessonFormData {
  title: string;
  content: string[];  
  courseId: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResponse {
  message: string;
  lesson?: Lesson;
  lessons?: Lesson[];
  error?: string;
}

// Create lesson API slice
export const lessonApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Create new lesson
    createLesson: builder.mutation<LessonResponse, LessonFormData>({
      query: (lessonData) => ({
        url: "/lessons",  // POST /api/lessons
        method: "POST",
        body: lessonData,
      }),
    }),

    // Get all lessons
    getAllLessons: builder.query<LessonResponse, void>({
      query: () => ({
        url: "/lessons",  // GET /api/lessons
        method: "GET",
      }),
    }),

    // Get single lesson by ID
    getLessonById: builder.query<LessonResponse, string>({
      query: (id) => ({
        url: `/lessons/${id}`,  // GET /api/lessons/:id
        method: "GET",
      }),
    }),

    // Update lesson
    updateLesson: builder.mutation<LessonResponse, { id: string; data: LessonFormData }>({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,  // PUT /api/lessons/:id
        method: "PUT",
        body: data,
      }),
    }),

    // Delete lesson
    deleteLesson: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/lessons/${id}`,  // DELETE /api/lessons/:id
        method: "DELETE",
      }),
    }),

  }),
  overrideExisting: false,
});

// Export auto-generated hooks
export const {
  useCreateLessonMutation,
  useGetAllLessonsQuery,
  useGetLessonByIdQuery,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
} = lessonApi;
