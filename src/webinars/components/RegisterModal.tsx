"use client";

// Webinar registration (dummy until the backend exists): details → payment (paid only) → confirmed.
// Waitlist mode for sold-out webinars. Uses the shared animated Modal.

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarDays, CalendarPlus, Clock, Lock, Tag, Users } from "lucide-react";
import toast from "react-hot-toast";
import * as api from "@/webinars/lib/api";
import type { Webinar } from "@/webinars/lib/types";
import { downloadIcs, fmtDate, fmtDuration, fmtTime, googleCalendarUrl, inr, quote, seatsLeft, totalMinutes, validateRegistration } from "@/webinars/lib/utils";
import { useCurrentUser } from "@/webinars/lib/hooks";
import { Button, Field, Input, Modal, buttonClass, cn } from "@/ui";
import WebinarCover from "./WebinarCover";

type Step = "details" | "payment" | "done";
const slide = { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.22 } };

export default function RegisterModal({ webinar: w, open, waitlist = false, onClose }: { webinar: Webinar; open: boolean; waitlist?: boolean; onClose: () => void }) {
  const user = useCurrentUser();
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [coupon, setCoupon] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [consent, setConsent] = useState(true);

  useEffect(() => {
    if (!open) return;
    setStep("details");
    setErrors({});
    setFailure(null);
    setCoupon("");
    setCouponInput("");
    setForm({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  }, [open, user]);

  const q = quote(w, coupon);
  const needsPayment = !waitlist && q.total > 0;

  const save = async (paymentRef?: string) => {
    await api.register({
      webinarId: w.id,
      ownerId: user?.id ?? "guest",
      name: form.name,
      email: form.email,
      phone: form.phone,
      amountPaid: waitlist ? 0 : q.total,
      couponCode: q.applied ? coupon.toUpperCase() : undefined,
      paymentRef,
      waitlisted: waitlist || undefined,
    });
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs = validateRegistration(form);
    if (!consent) errs.phone = errs.phone ?? "Please allow us to send joining details.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (api.isEmailRegistered(w.id, form.email)) {
      setErrors({ email: "This email is already registered. Log in with it to see the webinar in your dashboard." });
      return;
    }
    if (needsPayment) return setStep("payment");
    setBusy(true);
    try {
      await save();
      setStep("done");
    } catch (err) {
      setErrors({ email: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const payNow = async () => {
    if (busy) return;
    setBusy(true);
    setFailure(null);
    try {
      const p = await api.pay(q.total);
      await save(p.id);
      setStep("done");
    } catch (err) {
      setFailure((err as Error).message || "Payment didn't go through. No money was deducted — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const applyCoupon = () => {
    const r = quote(w, couponInput);
    if (r.error) toast.error(r.error);
    else {
      setCoupon(couponInput);
      toast.success(`Applied ${r.applied}`);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://vereda.co.in";
  const s = w.sessions[0];
  const titles: Record<Step, [string, string]> = {
    details: [waitlist ? "Join the waitlist" : "Save your seat", waitlist ? "We'll message you the moment a seat opens." : "Takes 30 seconds. Joining link comes on WhatsApp and email."],
    payment: ["Complete payment", `Paying as ${form.name} · ${form.email}`],
    done: [waitlist ? "You're on the waitlist" : "You're in!", waitlist ? "You can't join live until a seat is confirmed." : `Details are on their way to ${form.email}.`],
  };
  const stepIdx = step === "details" ? 0 : step === "payment" ? 1 : 2;
  const stepNames = needsPayment || step === "payment" ? ["Details", "Payment", "Done"] : ["Details", "Done"];

  return (
    <Modal open={open} onClose={onClose} closeDisabled={busy} size="lg" title={titles[step][0]} description={titles[step][1]} aside={<Aside w={w} />}>
      {/* step indicator */}
      <div className="mb-6 flex items-center gap-2" aria-hidden>
        {stepNames.map((n, i) => {
          const idx = stepNames.length === 2 && i === 1 ? 2 : i;
          const on = stepIdx >= idx;
          return (
            <div key={n} className="flex flex-1 flex-col gap-1.5">
              <span className="h-1 overflow-hidden rounded-full bg-surface">
                <motion.span className="block h-full rounded-full bg-brand-gradient" initial={false} animate={{ width: on ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
              </span>
              <span className={cn("text-[11px] font-medium", on ? "text-ink" : "text-ink-3")}>{n}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === "details" && (
          <motion.form key="details" onSubmit={submitDetails} className="space-y-4" noValidate {...slide}>
            <Field label="Full name" hint="Printed on your certificate" error={errors.name} htmlFor="rg-name">
              <Input id="rg-name" value={form.name} error={errors.name} autoComplete="name" placeholder="Your name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email" error={errors.email} htmlFor="rg-email">
              <Input id="rg-email" type="email" value={form.email} error={errors.email} autoComplete="email" placeholder="you@example.com" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="WhatsApp number" hint="Joining link + reminders" error={errors.phone} htmlFor="rg-phone">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-3">+91</span>
                <Input id="rg-phone" className="pl-12" inputMode="numeric" value={form.phone} error={errors.phone} autoComplete="tel-national" placeholder="98765 43210" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </Field>
            <label className="flex items-start gap-2.5 text-sm text-ink-3">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-brand-600" />
              Send me the joining link and reminders on email and WhatsApp.
            </label>
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {waitlist ? "Join waitlist" : needsPayment ? `Continue · ${inr(q.total)}` : "Register for free"}
              {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />}
            </Button>
            {!user && (
              <p className="text-center text-xs text-ink-3">
                Have an account?{" "}
                <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                  Log in
                </Link>{" "}
                to track this webinar and your certificate.
              </p>
            )}
          </motion.form>
        )}

        {step === "payment" && (
          <motion.div key="payment" className="space-y-4" {...slide}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="pl-10 uppercase placeholder:normal-case" />
              </div>
              <Button type="button" variant="outline" onClick={applyCoupon} disabled={!couponInput.trim() || busy}>
                Apply
              </Button>
            </div>
            <dl className="space-y-2.5 rounded-2xl bg-surface p-5 text-sm">
              <Row k="Webinar fee" v={inr(q.subtotal)} />
              {q.discount > 0 && <Row k={q.applied ?? "Discount"} v={`− ₹${q.discount}`} green />}
              <div className="border-t border-line pt-2.5">
                <Row k="Total" v={q.total === 0 ? "₹0" : inr(q.total)} bold />
              </div>
            </dl>
            {failure && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{failure}</p>}
            <Button size="lg" className="w-full" onClick={payNow} loading={busy}>
              {!busy && <Lock className="h-4 w-4" />}
              {busy ? "Processing…" : failure ? "Try again" : q.total === 0 ? "Confirm free seat" : `Pay ${inr(q.total)}`}
            </Button>
            <div className="flex items-center justify-between text-xs text-ink-3">
              <button onClick={() => setStep("details")} disabled={busy} className="hover:text-ink">
                Edit details
              </button>
              <span>Demo payment — Razorpay connects with the backend</span>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" className="py-2 text-center" {...slide}>
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60"
            >
              <BadgeCheck className="h-8 w-8" />
            </motion.span>
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line p-4 text-left">
              <p className="font-semibold text-ink">{w.title}</p>
              <p className="mt-1 text-sm text-ink-3">
                {fmtDate(s.startsAt)}, {fmtTime(s.startsAt)} IST · room opens 15 min before
              </p>
            </div>
            {!waitlist && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => downloadIcs(w, origin)}>
                  <CalendarPlus className="h-4 w-4" /> Add to calendar
                </Button>
                <a href={googleCalendarUrl(w, origin)} target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
                  Google Calendar
                </a>
              </div>
            )}
            <div className="mt-3 flex justify-center gap-2">
              {user ? <Button href="/dashboard/webinars" variant="dark">Go to My Webinars</Button> : <Button href="/login" variant="dark">Log in to track it</Button>}
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function Aside({ w }: { w: Webinar }) {
  const s = w.sessions[0];
  const left = seatsLeft(w);
  const pct = Math.min(100, Math.round((w.registeredCount / w.capacity) * 100));
  return (
    <div className="relative flex h-full flex-col bg-ink text-white">
      <WebinarCover topic={w.topic} className="aspect-[4/3] w-full opacity-90" />
      <div className="flex flex-1 flex-col gap-4 p-7">
        <p className="text-lg font-semibold leading-snug">{w.title}</p>
        <ul className="space-y-2.5 text-sm text-white/70">
          <li className="flex items-center gap-2.5"><CalendarDays className="h-4 w-4" /> {fmtDate(s.startsAt)}, {fmtTime(s.startsAt)} IST</li>
          <li className="flex items-center gap-2.5"><Clock className="h-4 w-4" /> {fmtDuration(totalMinutes(w))}{w.sessions.length > 1 && ` · ${w.sessions.length} sessions`}</li>
          <li className="flex items-center gap-2.5"><Users className="h-4 w-4" /> {left === 0 ? "Fully booked" : `${left} seats left`}</li>
        </ul>
        <div className="mt-auto">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-brand-gradient" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
          </div>
          <p className="mt-2 text-xs text-white/50">{pct}% of seats taken</p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, bold, green }: { k: string; v: string; bold?: boolean; green?: boolean }) {
  return (
    <div className={cn("flex justify-between text-ink-2", bold && "font-semibold text-ink", green && "text-emerald-700")}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
