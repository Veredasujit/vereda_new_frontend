export {};

declare global {
  interface RazorpayOptions {
    key: string|undefined;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    image?: string;
    order_id?: string;
    handler?: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
  }

  type RazorpayHandler = (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;

  interface Razorpay {
    open(): void;
    on(event: string, handler: RazorpayHandler): void;
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): Razorpay;
  }

  interface Window {
    Razorpay: RazorpayConstructor;
  }
  declare module "swiper/css";
  declare module "swiper/css/pagination";
  declare module "swiper/css/navigation";
}


