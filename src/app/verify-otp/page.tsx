// app/verify-otp/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { ArrowLeft, Award, ClipboardCheck, Hammer, MessageSquareText, Quote, RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAnimate, useReducedMotion } from "framer-motion";
import {
  useSignupVerifyOtpMutation,
  useLoginVerifyOtpMutation,
  useLoginRequestOtpMutation,
  useSignupRequestOtpMutation,
} from "@/Redux/api/authApi";
import { useAppDispatch } from "@/Redux/store";
import { setCredentials } from "@/Redux/slices/authSlice";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button, Reveal, Spinner, cn, motion } from "@/ui";

type User = {
  id: string;
  name: string;
  phone: string;
  profileURL: string;
  email: string;
  createdAt: Date;
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const emptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { error?: string; message?: string } }).data;
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
  }
  return fallback;
};

// "+919876543210" -> "+91 98765 43210"; other formats are shown as received.
const formatPhone = (phone: string) => {
  const match = phone.match(/^\+91(\d{5})(\d{5})$/);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
};

const proofPoints = [
  { icon: Hammer, text: "Hands-on, project-based learning" },
  { icon: ClipboardCheck, text: "Weekly tests to track progress" },
  { icon: Award, text: "Certificate when you finish" },
];

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-secondary/30 blur-3xl"
        aria-hidden
      />

      <Reveal className="relative">
        <Link
          href="/"
          aria-label="Vereda home"
          className="inline-flex rounded-xl bg-white px-3 py-2 shadow-[var(--shadow-soft)]"
        >
          <Image src="/images/logo.png" alt="Vereda" width={120} height={50} className="h-auto w-[120px] object-contain" priority />
        </Link>
      </Reveal>

      <div className="relative max-w-md">
        <Reveal delay={0.05}>
          <h2 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
            Build apps <span className="text-brand-300">people use.</span>
          </h2>
        </Reveal>
        <ul className="mt-10 space-y-4">
          {proofPoints.map(({ icon: Icon, text }, i) => (
            <Reveal as="li" key={text} delay={0.12 + i * 0.07} className="flex items-center gap-3 text-white/80">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-inset ring-white/15">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-[15px] font-medium">{text}</span>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal delay={0.35} className="relative">
        <figure className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <Quote className="h-5 w-5 text-brand-300" aria-hidden />
          <blockquote className="mt-3 text-[15px] leading-relaxed text-white/80">
            One code, no password. We check your phone each time you sign in.
          </blockquote>
          <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/50">
            Why a code
          </figcaption>
        </figure>
      </Reveal>
    </aside>
  );
}

const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div className="grid min-h-screen bg-white lg:grid-cols-2">
    <BrandPanel />
    <main className="relative flex items-center justify-center px-4 py-14 sm:px-8">
      <div className="bg-mesh pointer-events-none absolute inset-0 lg:hidden" aria-hidden />
      <Reveal className="relative w-full max-w-sm">
        <Link href="/" aria-label="Vereda home" className="mb-10 inline-flex lg:hidden">
          <Image src="/images/logo.png" alt="Vereda" width={120} height={50} className="h-auto w-[120px] object-contain" priority />
        </Link>
        {children}
      </Reveal>
    </main>
  </div>
);

/** Small ring that empties as the resend countdown runs out. */
function CountdownRing({ seconds }: { seconds: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, seconds / RESEND_SECONDS));
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-6 w-6 -rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" strokeWidth="2.5" className="stroke-line" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-brand-600 transition-[stroke-dashoffset] duration-1000 ease-linear"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
      </svg>
    </span>
  );
}

function SuccessCheck() {
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
const VerifyOtpContent = () => {
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastAutoSubmitted = useRef<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [shakeScope, animateShake] = useAnimate<HTMLDivElement>();
  const reduceMotion = useReducedMotion();

  // API mutations
  const [signupVerifyOtp] = useSignupVerifyOtpMutation();
  const [loginVerifyOtp] = useLoginVerifyOtpMutation();
  const [loginRequestOtp] = useLoginRequestOtpMutation();
  const [signupRequestOtp] = useSignupRequestOtpMutation();

  // Phone number and auth type from URL params
  const phoneNumber = searchParams.get("phone") || "";
  const authType: "signup" | "login" = searchParams.get("type") === "login" ? "login" : "signup";
  const username = searchParams.get("name") || "Username";
  const email = searchParams.get("email") || "example@gmail.com";
  const backHref = authType === "signup" ? "/register" : "/login";

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Shake the code boxes once whenever a new error appears.
  const otpError = errors.otp || errors.verify;
  useEffect(() => {
    if (!otpError || reduceMotion || !shakeScope.current) return;
    animateShake(shakeScope.current, { x: [0, -10, 10, -7, 7, -3, 3, 0] }, { duration: 0.45, ease: "easeOut" });
  }, [otpError, reduceMotion, animateShake, shakeScope]);

  const focusInput = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
  };

  const fillFrom = (startIndex: number, digits: string) => {
    setOtp((prev) => {
      const next = [...prev];
      digits
        .slice(0, OTP_LENGTH - startIndex)
        .split("")
        .forEach((char, i) => {
          next[startIndex + i] = char;
        });
      return next;
    });
    focusInput(startIndex + digits.length);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (errors.otp || errors.verify) setErrors((prev) => ({ ...prev, otp: "", verify: "" }));

    if (value === "") {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }
    if (!digits) return;

    // Typing into an already-filled box replaces its digit.
    if (digits.length === 2 && otp[index] && digits.startsWith(otp[index])) {
      handleOtpChange(index, digits[1]);
      return;
    }

    // Autofill (one-time-code) or fast typing can deliver several digits at once.
    if (digits.length > 1) {
      fillFrom(index, digits);
      return;
    }

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digits;
      return next;
    });
    if (index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    setOtp(() => {
      const next = emptyOtp();
      pasted.split("").forEach((char, i) => {
        next[i] = char;
      });
      return next;
    });
    focusInput(pasted.length);
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending || !phoneNumber) return;

    setIsResending(true);
    setErrors({});
    try {
      const response =
        authType === "login"
          ? await loginRequestOtp({ phone: phoneNumber }).unwrap()
          : await signupRequestOtp({ phone: phoneNumber, name: username, email }).unwrap();
      toast.success(response?.message || "New code sent");
      setCountdown(RESEND_SECONDS);
      setOtp(emptyOtp());
      lastAutoSubmitted.current = "";
      focusInput(0);
    } catch (error) {
      const message = getErrorMessage(error, "Could not resend the code. Please try again.");
      toast.error(message);
      setErrors({ resend: message });
    } finally {
      setIsResending(false);
    }
  };

  const verify = useCallback(
    async (otpString: string) => {
      if (otpString.length !== OTP_LENGTH || !/^\d+$/.test(otpString)) {
        setErrors({ otp: "Enter the 6-digit code" });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        let response;

        if (authType === "signup") {
          response = await signupVerifyOtp({
            phone: phoneNumber.replace(/\D/g, ""),
            otp: otpString,
            name: username,
            email: email,
          }).unwrap();
        } else {
          response = await loginVerifyOtp({
            phone: phoneNumber.replace(/\D/g, ""),
            otp: otpString,
          }).unwrap();
        }

        dispatch(
          setCredentials({
            user: response.user as User,
            token: response.token,
          })
        );
        toast.success(authType === "signup" ? "Account created" : "Logged in");
        setShowSuccess(true);

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (error: unknown) {
        const message = getErrorMessage(error, "That code didn't work. Please try again.");
        toast.error(message);
        setErrors({ verify: message });
      } finally {
        setIsLoading(false);
      }
    },
    [authType, phoneNumber, username, email, signupVerifyOtp, loginVerifyOtp, dispatch, router]
  );

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const code = otp.join("");
    lastAutoSubmitted.current = code;
    verify(code);
  };

  // Auto-submit once all digits are entered (only once per distinct code).
  useEffect(() => {
    const code = otp.join("");
    if (
      code.length === OTP_LENGTH &&
      !isLoading &&
      !showSuccess &&
      phoneNumber &&
      code !== lastAutoSubmitted.current
    ) {
      lastAutoSubmitted.current = code;
      verify(code);
    }
  }, [otp, isLoading, showSuccess, phoneNumber, verify]);

  const clearOtp = () => {
    setOtp(emptyOtp());
    lastAutoSubmitted.current = "";
    setErrors({});
    focusInput(0);
  };

  if (!phoneNumber) {
    return (
      <AuthShell>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Phone number missing</h1>
        <p className="mt-2 text-[15px] text-ink-3">We couldn&apos;t tell which number to verify. Please start again.</p>
        <Button href="/login" size="lg" className="mt-8 w-full">
          Back to log in
        </Button>
      </AuthShell>
    );
  }

  if (showSuccess) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center" role="status">
          <SuccessCheck />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
              {authType === "signup" ? "Account created" : "You're logged in"}
            </h1>
            <p className="mt-2 inline-flex items-center gap-2 text-[15px] text-ink-3">
              <Spinner className="h-4 w-4" /> Taking you to the home page...
            </p>
          </motion.div>
        </div>
      </AuthShell>
    );
  }

  const code = otp.join("");

  return (
    <AuthShell>
      <Link
        href={backHref}
        className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
        <MessageSquareText className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Enter your code</h1>
      <p className="mt-2 text-[15px] text-ink-3">
        Sent to <span className="whitespace-nowrap font-semibold text-ink">{formatPhone(phoneNumber)}</span>
      </p>

      <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5" noValidate>
        <fieldset>
          <legend className="sr-only">6-digit verification code</legend>
          <div ref={shakeScope} className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${index + 1}`}
                aria-invalid={!!otpError}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
                autoFocus={index === 0}
                className={cn(
                  "h-14 w-full min-w-0 max-w-14 rounded-xl border text-center text-2xl font-semibold text-ink caret-brand-600 outline-none transition-all duration-150 focus:ring-4 disabled:opacity-60",
                  otpError
                    ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-100"
                    : digit
                      ? "border-brand-300 bg-brand-50 focus:border-brand-500 focus:ring-brand-100"
                      : "border-line bg-white hover:border-brand-200 focus:border-brand-500 focus:ring-brand-100",
                )}
              />
            ))}
          </div>
        </fieldset>

        {otpError && (
          <p className="text-sm text-red-600" role="alert">
            {otpError}
          </p>
        )}

        <Button type="submit" size="lg" loading={isLoading} disabled={code.length !== OTP_LENGTH} className="w-full">
          {isLoading ? "Verifying..." : "Verify"}
        </Button>

        <div className="flex items-center justify-between text-sm">
          {countdown > 0 && !isResending ? (
            <span className="inline-flex min-h-11 items-center gap-2 text-ink-3" aria-live="polite">
              <CountdownRing seconds={countdown} />
              Resend in <span className="tabular-nums font-medium text-ink">{countdown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:text-ink-3"
            >
              {isResending ? <Spinner className="h-4 w-4" /> : <RotateCw className="h-4 w-4" aria-hidden />}
              {isResending ? "Sending..." : "Resend code"}
            </button>
          )}
          {code.length > 0 && (
            <button
              type="button"
              onClick={clearOtp}
              className="min-h-11 rounded-full px-3 font-medium text-ink-3 transition-colors hover:bg-surface hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        {errors.resend && (
          <p className="text-sm text-red-600" role="alert">
            {errors.resend}
          </p>
        )}
      </form>

      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-3">
        Wrong number?{" "}
        <Link href={backHref} className="font-semibold text-brand-600 hover:text-brand-700">
          Change it
        </Link>
      </p>
    </AuthShell>
  );
};

// Main component with Suspense boundary
const VerifyOtp = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
};

export default VerifyOtp;
