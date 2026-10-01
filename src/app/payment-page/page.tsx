// app/payment-page/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateOrderMutation, useVerifyPaymentMutation } from "@/Redux/api/paymentApi";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Info,
  Lock,
  RotateCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { AnimatePresence, Badge, Button, Card, Eyebrow, IconTile, Reveal, Spinner, motion } from "@/ui";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CourseData {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  instructor: string;
  duration: string;
  image: string;
  category: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface EnrollmentData {
  course: CourseData;
  user: UserData;
}

const formatINR = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : "₹—";
};

// Minimal shape check so a malformed link shows a clear message instead of crashing.
const isValidEnrollment = (data: unknown): data is EnrollmentData => {
  if (!data || typeof data !== "object") return false;
  const d = data as Partial<EnrollmentData>;
  const hasId = (v: unknown) => (typeof v === "string" && v !== "") || typeof v === "number";
  return (
    !!d.course &&
    !!d.user &&
    hasId(d.course.id) &&
    typeof d.course.title === "string" &&
    d.course.price !== null &&
    d.course.price !== undefined &&
    Number.isFinite(Number(d.course.price)) &&
    hasId(d.user.id)
  );
};

const CenteredCard = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-16">
    <Reveal className="w-full max-w-md">
      <Card className="p-8 text-center sm:p-10">{children}</Card>
    </Reveal>
  </div>
);

const EASE = [0.22, 1, 0.36, 1] as const;

function AnimatedCheck() {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60"
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
  );
}

// Separate component that uses useSearchParams
const PaymentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [imageFailed, setImageFailed] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        if (isValidEnrollment(decodedData)) {
          setEnrollmentData(decodedData);
        } else {
          setMessage("This payment link is missing course details.");
          setMessageType("error");
        }
      } catch (error) {
        setMessage("This payment link is invalid or incomplete.");
        setMessageType("error");
        console.error("Error parsing enrollment data:", error);
      }
    } else {
      setMessage("No course was selected.");
      setMessageType("error");
    }

    if (!user) {
      router.push("/login?redirect=/payment");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [searchParams, user, router]);

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const handlePayment = async () => {
    // Guard against double clicks before the disabled state renders.
    if (processingRef.current) return;

    if (!enrollmentData) {
      showMessage("No course selected", "error");
      return;
    }

    processingRef.current = true;
    setLoading(true);
    showMessage("");

    try {
      const orderResponse = await createOrder({
        amount: enrollmentData.course.price,
        enrollmentId: enrollmentData.course.id,
        userId: enrollmentData.user.id,
      }).unwrap();

      const { order, payment } = orderResponse;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Vereda Education",
        description: `Enrollment for ${enrollmentData.course.title}`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              enrollmentId: payment.enrollmentId,
              userId: enrollmentData.user.id,
              amount: enrollmentData.course.price,
            }).unwrap();

            if (verifyResponse.success) {
              showMessage("Payment successful. Redirecting to your dashboard...", "success");
              setTimeout(() => {
                router.push(`/dashboard`);
              }, 2000);
            } else {
              showMessage("Payment verification failed.", "error");
            }
          } catch (err) {
            showMessage("Error verifying payment.", "error");
            console.error("Payment verification error:", err);
          }
        },
        prefill: {
          name: enrollmentData.user.name,
          email: enrollmentData.user.email,
          contact: user?.phone || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function () {
            showMessage("Payment cancelled", "info");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      let message = "Error creating order.";

      if (err && typeof err === "object" && "data" in err) {
        const e = err as { data?: { message?: string } };
        if (e.data?.message) message = e.data.message;
      }

      showMessage(message, "error");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  };

  // Loading state
  if (!enrollmentData && !message) {
    return (
      <CenteredCard>
        <Spinner className="mx-auto h-8 w-8" />
        <p className="mt-4 text-sm text-ink-3">Loading course details...</p>
      </CenteredCard>
    );
  }

  // Error state
  if (message && !enrollmentData) {
    return (
      <CenteredCard>
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
          <AlertCircle className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Can&apos;t start checkout</h1>
        <p className="mt-2 text-sm text-ink-3">{message} Please pick a course and try again.</p>
        <Button href="/view-courses" variant="dark" size="lg" className="mt-8 w-full">
          Browse courses
        </Button>
      </CenteredCard>
    );
  }

  if (!enrollmentData) return null;

  const { course } = enrollmentData;
  const price = Number(course.price);
  const originalPrice = Number(course.originalPrice);
  const hasDiscount = Number.isFinite(originalPrice) && originalPrice > price;
  const discountPercentage = Number(course.discountPercentage);
  const paid = messageType === "success";
  const failed = messageType === "error" && !!message;
  const panel: "pay" | "success" | "error" = paid ? "success" : failed ? "error" : "pay";

  return (
    <div className="relative min-h-screen bg-surface">
      <div className="bg-mesh pointer-events-none absolute inset-x-0 top-0 h-80 opacity-80" aria-hidden />
      <div className="container-x relative py-10 sm:py-16">
        <Reveal>
          <Link
            href="/view-courses"
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to courses
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Checkout</Eyebrow>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">Complete your enrollment</h1>
            </div>
            <Badge tone="neutral">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Secure checkout
            </Badge>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
          {/* Order summary */}
          <Reveal delay={0.05}>
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/8] w-full bg-surface">
                {course.image && !imageFailed ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={960}
                    height={480}
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-50">
                    <BookOpen className="h-10 w-10 text-brand-300" aria-hidden />
                  </div>
                )}
                {course.category && (
                  <Badge tone="brand" className="absolute left-4 top-4 bg-white/90 backdrop-blur">
                    {course.category}
                  </Badge>
                )}
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Order summary</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{course.title}</h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3">
                  {course.instructor && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-4 w-4" aria-hidden /> {course.instructor}
                    </span>
                  )}
                  {course.duration && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden /> {course.duration}
                    </span>
                  )}
                </div>

                {/* Price breakdown */}
                <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                  {hasDiscount && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-ink-3">Original price</dt>
                        <dd className="text-ink-3 line-through">{formatINR(originalPrice)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="inline-flex items-center gap-2 text-ink-3">
                          Discount
                          {Number.isFinite(discountPercentage) && discountPercentage > 0 && (
                            <Badge tone="success" className="py-0.5">
                              {discountPercentage}% off
                            </Badge>
                          )}
                        </dt>
                        <dd className="font-medium text-emerald-700">-{formatINR(originalPrice - price)}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex items-baseline justify-between border-t border-line pt-4">
                    <dt className="text-base font-semibold text-ink">Total</dt>
                    <dd className="text-2xl font-semibold tracking-tight text-ink">{formatINR(price)}</dd>
                  </div>
                </dl>

                {/* Student */}
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface p-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-600 ring-1 ring-inset ring-line">
                    {(enrollmentData.user.name || "?").trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-3">Enrolling as</p>
                    <p className="truncate text-sm font-semibold text-ink">{enrollmentData.user.name || "—"}</p>
                    <p className="truncate text-xs text-ink-3">{enrollmentData.user.email || "—"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Payment */}
          <Reveal delay={0.12} className="lg:sticky lg:top-8">
            <Card className="overflow-hidden p-6 sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {panel === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="flex flex-col items-center py-4 text-center"
                    role="status"
                  >
                    <AnimatedCheck />
                    <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Payment successful</h2>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink-3">
                      <Spinner className="h-4 w-4" /> Redirecting to your dashboard...
                    </p>
                    <ol className="mt-6 w-full space-y-2 text-left text-sm text-ink-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" aria-hidden /> Enrollment confirmed
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" aria-hidden /> Course added to your dashboard
                      </li>
                    </ol>
                    <Button href="/dashboard" size="lg" className="mt-8 w-full">
                      Go to dashboard <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </motion.div>
                )}

                {panel === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex flex-col items-center py-4 text-center"
                    role="alert"
                  >
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60">
                      <XCircle className="h-8 w-8" aria-hidden />
                    </span>
                    <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Payment didn&apos;t go through</h2>
                    <p className="mt-2 text-sm text-ink-3">{message}</p>
                    <p className="mt-1 text-xs text-ink-3">If money was deducted, it will be refunded or confirmed automatically.</p>
                    <Button onClick={handlePayment} loading={loading} size="lg" className="mt-8 w-full">
                      {!loading && <RotateCw className="h-4 w-4" aria-hidden />}
                      {loading ? "Processing..." : "Try again"}
                    </Button>
                    <Button href="mailto:support@vereda.co.in" variant="ghost" className="mt-2 w-full">
                      Contact support
                    </Button>
                  </motion.div>
                )}

                {panel === "pay" && (
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <div className="flex items-center gap-3">
                      <IconTile>
                        <Lock className="h-5 w-5" aria-hidden />
                      </IconTile>
                      <div>
                        <h2 className="text-lg font-semibold text-ink">Pay securely</h2>
                        <p className="text-xs text-ink-3">UPI, cards, net banking and wallets</p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-baseline justify-between">
                      <span className="text-sm text-ink-3">Amount due</span>
                      <span className="text-4xl font-semibold tracking-tight text-ink">{formatINR(price)}</span>
                    </div>
                    <p className="mt-1 text-right text-xs text-ink-3">Inclusive of all taxes</p>

                    <Button
                      onClick={handlePayment}
                      disabled={paid}
                      loading={loading}
                      aria-busy={loading}
                      size="lg"
                      className="mt-8 w-full"
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <Lock className="h-4 w-4" aria-hidden /> Pay {formatINR(price)}
                        </>
                      )}
                    </Button>

                    <AnimatePresence>
                      {message && messageType === "info" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          role="status"
                          className="overflow-hidden"
                        >
                          <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface p-3 text-sm text-ink-2">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
                            <span>{message}. You can try again any time.</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-6 flex items-center justify-center gap-4 border-t border-line pt-6 text-xs font-medium text-ink-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" aria-hidden /> Secured by Razorpay
                      </span>
                      <span className="h-3 w-px bg-line" aria-hidden />
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Encrypted
                      </span>
                    </div>

                    <p className="mt-4 text-center text-xs text-ink-3">
                      By paying, you agree to our{" "}
                      <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-ink">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <p className="mt-4 text-center text-sm text-ink-3">
              Need help?{" "}
              <a href="mailto:support@vereda.co.in" className="font-semibold text-brand-600 hover:text-brand-700">
                Contact support
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const PaymentPage = () => {
  return (
    <Suspense
      fallback={
        <CenteredCard>
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-4 text-sm text-ink-3">Loading checkout...</p>
        </CenteredCard>
      }
    >
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;
