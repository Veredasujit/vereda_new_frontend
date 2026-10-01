// app/login/page.tsx (Next.js App Router)
"use client";

import { useState } from "react";
import { ArrowRight, Award, ChevronDown, ClipboardCheck, Hammer, Quote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginRequestOtpMutation } from "@/Redux/api/authApi";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button, Field, Input, Reveal, cn, inputClass } from "@/ui";

const DEFAULT_ERROR =
  "Could not send the code. Check the number, or create an account if you don't have one.";

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
            Learn a skill, build something real with it, then prove it. That is the whole idea.
          </blockquote>
          <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/50">
            The Vereda approach
          </figcaption>
        </figure>
      </Reveal>
    </aside>
  );
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [errors, setErrors] = useState({ phone: "" });
  const router = useRouter();
  const [loginRequestOtp] = useLoginRequestOtpMutation();

  const validatePhone = (digits: string) => {
    if (countryCode === "+91") {
      if (!/^\d{10}$/.test(digits)) return "Enter a 10-digit mobile number";
      return "";
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(countryCode + digits) || digits.length < 6) {
      return "Enter a valid phone number";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrors({ phone: "" });

    const digits = phone.replace(/\D/g, "");
    const validationError = validatePhone(digits);
    if (validationError) {
      setErrors({ phone: validationError });
      return;
    }

    const fullPhone = countryCode + digits;
    setIsLoading(true);

    try {
      const response = await loginRequestOtp({ phone: fullPhone }).unwrap();
      toast.success(response?.message || "Code sent");
      router.push(`/verify-otp?phone=${encodeURIComponent(fullPhone)}&type=login`);
    } catch (error) {
      const message = getErrorMessage(error, DEFAULT_ERROR);
      toast.error(message);
      setErrors({ phone: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, ""));
    if (errors.phone) setErrors({ phone: "" });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCountryCode(next);
    if (next === "+91") setPhone((p) => p.slice(0, 10));
    if (errors.phone) setErrors({ phone: "" });
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

          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-[15px] text-ink-3">We&apos;ll text a one-time code to your phone.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
                  value={phone}
                  onChange={handlePhoneChange}
                  aria-invalid={!!errors.phone}
                  error={errors.phone}
                  className="min-w-0 flex-1 tracking-wide"
                  required
                  maxLength={countryCode === "+91" ? 10 : 14}
                />
              </div>
            </Field>

            <Button type="submit" size="lg" loading={isLoading} className="w-full">
              {isLoading ? (
                "Sending code..."
              ) : (
                <>
                  Send code
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-3">
            New to Vereda?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
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
