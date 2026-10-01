"use client";

// Contact popup with phone verification.
// Uses only endpoints that already exist in src/Redux/api:
//   1. auth/signup/request-otp  (new number)  → falls back to auth/login/request-otp (existing account)
//   2. auth/signup/verify-otp   or auth/login/verify-otp
//   3. contacts/create-contact  (saved only after the number is verified)
// A logged-in user whose account phone matches skips the OTP step.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock, PhoneCall, ShieldCheck } from "lucide-react";
import { Button, Field, Input, Modal, Textarea, cn } from "@/ui";
import type { RootState } from "@/Redux/store";
import { useAppDispatch } from "@/Redux/store";
import { setCredentials } from "@/Redux/slices/authSlice";
import {
  useLoginRequestOtpMutation,
  useLoginVerifyOtpMutation,
  useSignupRequestOtpMutation,
  useSignupVerifyOtpMutation,
} from "@/Redux/api/authApi";
import { useCreateContactMutation } from "@/Redux/api/contactApi";

export const OPEN_EVENT = "vereda:open-contact";
/** Open the popup from anywhere on a page where <ContactPopup/> is mounted. */
export const openContactPopup = (interest?: Interest) =>
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { interest } }));

const DONE_KEY = "vereda_contact_verified_v1"; // set after a verified submission → never auto-open again
const DISMISS_KEY = "vereda_contact_dismissed_v1"; // per browser session

const INTERESTS = ["Course", "Webinar", "Free counselling", "Something else"] as const;
type Interest = (typeof INTERESTS)[number];
type Step = "details" | "otp" | "done";
type Mode = "signup" | "login" | "none";

const RESEND_SECONDS = 30;

function errorText(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "data" in err) {
    const d = (err as { data?: unknown }).data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as { error?: string; message?: string };
      if (o.error) return o.error;
      if (o.message) return o.message;
    }
  }
  return fallback;
}

const tenDigits = (v: string) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

export default function ContactPopup({
  defaultInterest = "Course",
  delayMs = 8000,
  autoOpen = true,
}: {
  defaultInterest?: Interest;
  delayMs?: number;
  autoOpen?: boolean;
}) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [mode, setMode] = useState<Mode>("none");
  const [form, setForm] = useState({ name: "", phone: "", email: "", interest: defaultInterest as Interest, message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "otp" | "form", string>>>({});
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [contactPending, setContactPending] = useState(false); // verified, but saving the enquiry failed
  const otpRef = useRef<HTMLInputElement>(null);

  const [signupRequestOtp] = useSignupRequestOtpMutation();
  const [loginRequestOtp] = useLoginRequestOtpMutation();
  const [signupVerifyOtp] = useSignupVerifyOtpMutation();
  const [loginVerifyOtp] = useLoginVerifyOtpMutation();
  const [createContact] = useCreateContactMutation();

  const digits = tenDigits(form.phone);
  const fullPhone = `+91${digits}`;

  const openPopup = useCallback(
    (interest?: Interest) => {
      setStep("details");
      setErrors({});
      setOtp("");
      setContactPending(false);
      setForm((f) => ({
        ...f,
        interest: interest ?? f.interest,
        name: f.name || authUser?.name || "",
        email: f.email || authUser?.email || "",
        phone: f.phone || (authUser?.phone ? tenDigits(authUser.phone) : ""),
      }));
      setOpen(true);
    },
    [authUser],
  );

  const close = useCallback(() => {
    if (busy) return;
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage blocked */
    }
  }, [busy]);

  // auto-open once per session, never after a verified submission, never for signed-in users
  useEffect(() => {
    if (!autoOpen) return;
    let skip = false;
    try {
      skip = !!localStorage.getItem(DONE_KEY) || !!sessionStorage.getItem(DISMISS_KEY) || !!localStorage.getItem("token");
    } catch {
      skip = true;
    }
    if (skip) return;
    const id = setTimeout(() => openPopup(defaultInterest), delayMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, delayMs, defaultInterest, pathname]);

  // manual open from buttons
  useEffect(() => {
    const onOpen = (e: Event) => openPopup((e as CustomEvent<{ interest?: Interest }>).detail?.interest);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [openPopup]);

  // resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(digits)) e.phone = "Enter a valid 10-digit mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.message.length > 500) e.message = "Keep the message under 500 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveEnquiry = async () => {
    const res = await createContact({
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: digits,
      subject: `${form.interest} enquiry`,
      message: [form.message.trim(), `Page: ${pathname}`, "Phone verified by OTP"].filter(Boolean).join("\n"),
    }).unwrap();
    if (res && res.success === false) throw { data: { message: res.message } };
  };

  const finish = async () => {
    try {
      await saveEnquiry();
      setContactPending(false);
      try {
        localStorage.setItem(DONE_KEY, digits);
      } catch {
        /* ignore */
      }
      setStep("done");
    } catch (err) {
      setContactPending(true);
      setErrors({ form: errorText(err, "Your number is verified, but we couldn't save your message. Please try again.") });
    }
  };

  const sendOtp = async () => {
    setBusy(true);
    setErrors({});
    try {
      try {
        await signupRequestOtp({ phone: fullPhone, name: form.name.trim(), email: form.email.trim() }).unwrap();
        setMode("signup");
      } catch (signupErr) {
        // number already has an account → verify through login instead
        try {
          await loginRequestOtp({ phone: fullPhone }).unwrap();
          setMode("login");
        } catch {
          throw signupErr;
        }
      }
      setOtp("");
      setResendIn(RESEND_SECONDS);
      setStep("otp");
      toast.success(`Code sent to +91 ${digits}`);
    } catch (err) {
      setErrors({ form: errorText(err, "We couldn't send the code. Check the number and try again.") });
    } finally {
      setBusy(false);
    }
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !validate()) return;
    // signed-in user with the same number is already verified
    if (authUser?.phone && tenDigits(authUser.phone) === digits) {
      setBusy(true);
      await finish();
      setBusy(false);
      return;
    }
    await sendOtp();
  };

  const verify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (contactPending) {
      setBusy(true);
      await finish();
      setBusy(false);
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: "Enter the 6-digit code." });
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      // same phone format the existing verify-otp page sends
      const phone = fullPhone.replace(/\D/g, "");
      const res =
        mode === "signup"
          ? await signupVerifyOtp({ phone, otp, name: form.name.trim(), email: form.email.trim() }).unwrap()
          : await loginVerifyOtp({ phone, otp }).unwrap();
      if (res?.token && res.user) {
        dispatch(setCredentials({ user: res.user as never, token: res.token }));
      }
      await finish();
    } catch (err) {
      setErrors({ otp: errorText(err, "That code didn't work. Check it and try again.") });
    } finally {
      setBusy(false);
    }
  };

  // auto-submit when 6 digits are entered
  useEffect(() => {
    if (step === "otp" && otp.length === 6 && !busy && !contactPending) void verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const headings: Record<Step, [string, string]> = {
    details: ["Talk to our team", "Share your details and a mentor will call you back."],
    otp: ["Verify your number", `Enter the 6-digit code sent to +91 ${digits}.`],
    done: ["You're all set", "Expect a call within one working day."],
  };
  const skipOtp = !!authUser?.phone && tenDigits(authUser.phone) === digits;

  return (
    <Modal
      open={open}
      onClose={close}
      closeDisabled={busy}
      size="lg"
      title={headings[step][0]}
      description={headings[step][1]}
      aside={<Aside step={step} />}
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === "details" && (
          <motion.form key="details" onSubmit={submitDetails} noValidate className="space-y-4" {...slide}>
            <Field label="Full name" error={errors.name} htmlFor="cp-name">
              <Input id="cp-name" value={form.name} autoComplete="name" error={errors.name} placeholder="Your name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mobile number" error={errors.phone} htmlFor="cp-phone">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-3">+91</span>
                  <Input id="cp-phone" className="pl-12" value={form.phone} inputMode="numeric" autoComplete="tel-national" maxLength={14} error={errors.phone} placeholder="98765 43210" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </Field>
              <Field label="Email" error={errors.email} htmlFor="cp-email">
                <Input id="cp-email" type="email" value={form.email} autoComplete="email" error={errors.email} placeholder="you@example.com" onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
            <Field label="I'm interested in">
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {INTERESTS.map((i) => {
                  const on = form.interest === i;
                  return (
                    <button
                      type="button"
                      key={i}
                      role="radio"
                      aria-checked={on}
                      onClick={() => setForm({ ...form, interest: i })}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        on ? "border-brand-600 bg-brand-600 text-white shadow-[var(--shadow-glow)]" : "border-line text-ink-2 hover:border-brand-200 hover:text-ink",
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Message" hint="Optional" error={errors.message} htmlFor="cp-msg">
              <Textarea id="cp-msg" rows={3} maxLength={500} value={form.message} error={errors.message} placeholder="What would you like to know?" onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </Field>

            {errors.form && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{errors.form}</p>}

            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {skipOtp ? "Send enquiry" : "Continue"}
              {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-3">
              <ShieldCheck className="h-3.5 w-3.5" /> {skipOtp ? "Your number is already verified." : "We verify your number with a one-time code."}
            </p>
          </motion.form>
        )}

        {step === "otp" && (
          <motion.form key="otp" onSubmit={verify} className="space-y-5" {...slide}>
            {!contactPending && (
              <Field label="Verification code" error={errors.otp} htmlFor="cp-otp">
                <Input
                  id="cp-otp"
                  ref={otpRef}
                  className="h-14 text-center font-mono text-2xl tracking-[0.6em]"
                  value={otp}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  error={errors.otp}
                  placeholder="------"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </Field>
            )}
            {errors.form && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{errors.form}</p>}

            <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!contactPending && otp.length !== 6}>
              {contactPending ? "Try sending again" : "Verify and send"}
            </Button>

            {!contactPending && (
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep("details")} disabled={busy} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink">
                  <ArrowLeft className="h-4 w-4" /> Change number
                </button>
                <button type="button" onClick={sendOtp} disabled={busy || resendIn > 0} className="font-semibold text-brand-700 disabled:font-normal disabled:text-ink-3">
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            )}
          </motion.form>
        )}

        {step === "done" && (
          <motion.div key="done" className="py-6 text-center" {...slide}>
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60"
            >
              <BadgeCheck className="h-8 w-8" />
            </motion.span>
            <p className="mx-auto mt-5 max-w-xs text-sm text-ink-3">
              +91 {digits} is verified{mode === "signup" ? " and your Vereda account is ready" : ""}. We&apos;ll be in touch about: <span className="font-medium text-ink">{form.interest}</span>.
            </p>
            <Button variant="outline" className="mt-7" onClick={close}>
              Back to the page
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.22 },
};

function Aside({ step }: { step: Step }) {
  const steps = ["Your details", "Verify phone", "We call you"];
  const at = step === "details" ? 0 : step === "otp" ? 1 : 2;
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-ink p-8 text-white">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/40 blur-3xl" aria-hidden />
      <div className="relative">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <PhoneCall className="h-5 w-5" />
        </span>
        <p className="mt-6 text-2xl font-semibold leading-tight tracking-tight">A real mentor, not a bot.</p>
        <p className="mt-2 text-sm text-white/60">Get answers on courses, webinars and batches.</p>
      </div>
      <ol className="relative space-y-4">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                i < at ? "bg-emerald-500 text-white" : i === at ? "bg-white text-ink" : "bg-white/10 text-white/50",
              )}
            >
              {i + 1}
            </span>
            <span className={i <= at ? "text-white" : "text-white/50"}>{s}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 pt-2 text-xs text-white/50">
          <Clock className="h-3.5 w-3.5" /> Usually within one working day
        </li>
      </ol>
    </div>
  );
}
