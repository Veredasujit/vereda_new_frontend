import { apiSlice } from "../apiSlice";

// Helpers for managing tokens (if applicable)
const setToken = (token: string) => localStorage.setItem("token", token);
const clearToken = () => localStorage.removeItem("token");

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────
    // Signup: Request OTP
    // ─────────────────────────────
    signupRequestOtp: builder.mutation<
      { message: string },                  // Response type
      { phone: string;name:string;email:string }                     // Request body
    >({
      query: (body) => ({
        url: "auth/signup/request-otp",
        method: "POST",
        body,
      }),
    }),

    // ─────────────────────────────
    // Signup: Verify OTP
    // ─────────────────────────────
    signupVerifyOtp: builder.mutation<
      { message: string; token: string;
              user?: {
                name: string;
                phone: string;
                email:string;
              }
       }, // Response
      { phone: string; otp: string ;name:string;email:string}                   // Request body
    >({
      query: (body) => ({
        url: "auth/signup/verify-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) setToken(data.token);
        } catch {
          // ignore errors
        }
      },
    }),

    // ─────────────────────────────
    // Login: Request OTP
    // ─────────────────────────────
    loginRequestOtp: builder.mutation<
      { message: string },
      { phone: string }
    >({
      query: (body) => ({
        url: "auth/login/request-otp",
        method: "POST",
        body,
      }),
    }),

    // ─────────────────────────────
    // Login: Verify OTP
    // ─────────────────────────────
    loginVerifyOtp: builder.mutation<
      { message: string; token: string; // Use
        user?: {
          name: string;
          phone: string;
        }; },
      { phone: string; otp: string }
    >({
      query: (body) => ({
        url: "auth/login/verify-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) setToken(data.token);
        } catch {
          // ignore errors
        }
      },
    }),

    // ─────────────────────────────
    // Logout
    // ─────────────────────────────
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout", // optional: use your actual logout endpoint
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearToken();
        }
      },
    }),
  }),

  overrideExisting: false,
});

// ─────────────────────────────
// Hooks
// ─────────────────────────────
export const {
  useSignupRequestOtpMutation,
  useSignupVerifyOtpMutation,
  useLoginRequestOtpMutation,
  useLoginVerifyOtpMutation,
  useLogoutMutation,
} = authApi;
