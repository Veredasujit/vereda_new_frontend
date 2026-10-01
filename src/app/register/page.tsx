// app/register/page.tsx (Next.js App Router)
"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Award, Check, ChevronDown, ClipboardCheck, Hammer, Quote } from "lucide-react";
import Link from "next/link";
import { useSignupRequestOtpMutation } from "@/Redux/api/authApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { AnimatePresence, Button, Field, Input, Reveal, cn, inputClass, motion } from "@/ui";

const DEFAULT_ERROR = "Could not create your account. Please try again.";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { error?: string; message?: string } }).data;
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
  }
  return fallback;
};

const countryCodes = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+49", country: "DE" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const STEPS = ["Details", "Phone"] as const;

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
            No password to remember. Your phone is your login, and your progress follows you.
          </blockquote>
          <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/50">
            How sign-up works
          </figcaption>
        </figure>
      </Reveal>
    </aside>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <ol className="flex items-center justify-between text-sm" aria-label="Sign-up progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                  done || active ? "bg-brand-600 text-white" : "bg-surface text-ink-3 ring-1 ring-inset ring-line",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}
              </span>
              <span className={cn("font-medium", active || done ? "text-ink" : "text-ink-3")}>{label}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
        <motion.div
          className="h-full rounded-full bg-brand-gradient"
          initial={false}
          animate={{ width: `${(step / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupRequestOtp] = useSignupRequestOtpMutation();
  const router = useRouter();

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const first = formData.firstName.trim();
      const email = formData.email.trim();
      if (!first) newErrors.firstName = "Enter your first name";
      else if (first.length < 2) newErrors.firstName = "Name is too short";

      if (!email) newErrors.email = "Enter your email";
      else if (!EMAIL_REGEX.test(email)) newErrors.email = "Enter a valid email address";
    }

    if (step === 2) {
      const digits = formData.phone.replace(/\D/g, "");
      if (!digits) {
        newErrors.phone = "Enter your phone number";
      } else if (countryCode === "+91" && !/^\d{10}$/.test(digits)) {
        newErrors.phone = "Enter a 10-digit mobile number";
      } else if (
        countryCode !== "+91" &&
        (!/^\+?[1-9]\d{1,14}$/.test(countryCode + digits) || digits.length < 6)
      ) {
        newErrors.phone = "Enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone: value }));
    if (errors.phone || errors.submit) setErrors((prev) => ({ ...prev, phone: "", submit: "" }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCountryCode(next);
    if (next === "+91") setFormData((prev) => ({ ...prev, phone: prev.phone.slice(0, 10) }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Pressing Enter on step 1 should advance, not submit.
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep(1)) {
        setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) return;

    const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const email = formData.email.trim();
    const fullPhone = countryCode + formData.phone.replace(/\D/g, "");

    setIsLoading(true);

    try {
      const response = await signupRequestOtp({
        phone: fullPhone,
        name,
        email,
      }).unwrap();
      toast.success(response?.message || "Code sent");

      // Store user data temporarily for the OTP verification
      localStorage.setItem(
        "tempUserData",
        JSON.stringify({
          name,
          phone: fullPhone,
          email,
        })
      );

      router.push(
        `/verify-otp?phone=${encodeURIComponent(fullPhone)}&type=signup&name=${encodeURIComponent(
          name
        )}&email=${encodeURIComponent(email)}`
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error, DEFAULT_ERROR);
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <BrandPanel />

      <main className="relative flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="bg-mesh pointer-events-none absolute inset-0 lg:hidden" aria-hidden />
        <Reveal className="relative w-full max-w-sm">
          <Link href="/" aria-label="Vereda home" className="mb-10 inline-flex lg:hidden">
            <Image src="/images/logo.png" alt="Vereda" width={120} height={50} className="h-auto w-[120px] object-contain" priority />
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Create your account</h1>
          <p className="mt-2 text-[15px] text-ink-3">
            {currentStep === 1 ? "Two quick steps. No password needed." : "We'll text a one-time code to this number."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8" noValidate>
            <StepIndicator step={currentStep} />

            <div className="overflow-hidden px-1 -mx-1 pb-1">
              <AnimatePresence mode="wait" initial={false}>
                {currentStep === 1 ? (
                  <motion.div
                    key="step-1"
                   
                    initial={{ opacity: 0, x: -32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -32 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First name" htmlFor="firstName" error={errors.firstName}>
                        <Input
                          id="firstName"
                          type="text"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          aria-invalid={!!errors.firstName}
                          error={errors.firstName}
                          required
                          maxLength={50}
                        />
                      </Field>
                      <Field label="Last name" hint="Optional" htmlFor="lastName">
                        <Input
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          maxLength={50}
                        />
                      </Field>
                    </div>

                    <Field label="Email" htmlFor="email" error={errors.email}>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        aria-invalid={!!errors.email}
                        error={errors.email}
                        required
                        maxLength={120}
                      />
                    </Field>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                   
                    initial={{ opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 32 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Field label="Phone number" htmlFor="phone" error={errors.phone}>
                      <div className="flex gap-2">
                        <div className="relative w-[6.5rem] shrink-0">
                          <label htmlFor="countryCode" className="sr-only">
                            Country code
                          </label>
                          <select
                            id="countryCode"
                            value={countryCode}
                            onChange={handleCountryChange}
                            className={cn(inputClass(), "cursor-pointer appearance-none pl-3 pr-8")}
                          >
                            {countryCodes.map(({ code, country }) => (
                              <option key={code} value={code}>
                                {code} {country}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder={countryCode === "+91" ? "98765 43210" : "Phone number"}
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          aria-invalid={!!errors.phone}
                          error={errors.phone}
                          className="min-w-0 flex-1 tracking-wide"
                          required
                          maxLength={countryCode === "+91" ? 10 : 14}
                          autoFocus
                        />
                      </div>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {errors.submit && (
              <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.submit}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              {currentStep > 1 && (
                <Button type="button" variant="outline" size="lg" onClick={handlePreviousStep} disabled={isLoading} aria-label="Back to details">
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </Button>
              )}

              {currentStep < 2 ? (
                <Button type="button" size="lg" onClick={handleNextStep} className="flex-1">
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                </Button>
              ) : (
                <Button type="submit" size="lg" loading={isLoading} className="flex-1">
                  {isLoading ? "Sending code..." : "Send code"}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-ink-3">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Log in
            </Link>
          </p>

          <p className="mt-10 border-t border-line pt-6 text-center text-xs text-ink-3">
            By continuing, you agree to our{" "}
            <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </Reveal>
      </main>
    </div>
  );
}
