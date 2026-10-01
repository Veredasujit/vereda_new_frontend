// features/payment/paymentApi.ts
import { apiSlice } from "../apiSlice";

// Backend types
export interface Payment {
  id: string;
  userId: string;
  enrollmentId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  amount: number;
  currency: string;
}

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentById: builder.query<{ success: boolean; payment: Payment }, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET",
      }),
    }),
    createOrder: builder.mutation<
      { success: boolean; order: Order; payment: Payment },
      { amount: number; currency?: string; enrollmentId: string; userId: string }
    >({
      query: (body) => ({
        url: "/payments/create-order",
        method: "POST",
        body,
      }),
    }),
    verifyPayment: builder.mutation<
      { success: boolean },
      { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; enrollmentId: string; userId: string; amount: number }
    >({
      query: (body) => ({
        url: "/payments/verify",
        method: "POST",
        body,
      }),
    }),
    deletePayment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPaymentByIdQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useDeletePaymentMutation,
} = paymentApi;
