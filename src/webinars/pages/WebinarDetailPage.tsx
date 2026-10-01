"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Award,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  Clock,
  Globe2,
  Loader2,
  PlayCircle,
  Share2,
  Signal,
  Users,
  Video,
} from "lucide-react";
import * as api from "@/webinars/lib/api";
import { useCurrentUser, useNow, useRegistration } from "@/webinars/lib/hooks";
import type { Webinar, WebinarRegistration } from "@/webinars/lib/types";
import {
  CERT_COPY,
  certificateState,
  countdown,
  downloadIcs,
  endOf,
  fmtDate,
  fmtDateLong,
  fmtDuration,
  fmtTime,
  googleCalendarUrl,
  inr,
  joinWindow,
  recordingExpiresAt,
  recordingState,
  registrationAvailability,
  seatsLeft,
  startOf,
  statusBadge,
  t,
  totalMinutes,
  webinarStatus,
} from "@/webinars/lib/utils";
import WebinarCover from "@/webinars/components/WebinarCover";
import RegisterModal from "@/webinars/components/RegisterModal";
import RelatedCourse from "@/webinars/components/RelatedCourse";
import WebinarNotFound from "@/webinars/components/WebinarNotFound";
import { TOPIC_LABEL } from "@/webinars/components/WebinarCard";
import { Avatar, Badge, Button, Card, Skeleton, cx } from "@/webinars/components/ui";
import { Accordion, Parallax, Reveal, motion } from "@/ui";
import { openContactPopup } from "@/contact-popup/ContactPopup";

export default function WebinarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const w = api.getWebinarBySlug(slug);
  const now = useNow(1000);
  const reg = useRegistration(w?.id);
  const [modal, setModal] = useState<null | "register" | "waitlist">(null);

  if (!w) return <WebinarNotFound />;

  const speakers = w.speakerIds.map(api.getSpeaker).filter(Boolean);
  const facts = [
    [CalendarDays, "Date", now ? `${fmtDate(w.sessions[0].startsAt)}, ${fmtTime(w.sessions[0].startsAt)}` : "—"],
    [Clock, "Duration", `${fmtDuration(totalMinutes(w))}${w.sessions.length > 1 ? ` · ${w.sessions.length} sessions` : ""}`],
    [Globe2, "Language", w.language],
    [Signal, "Level", w.level],
  ] as const;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: w.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user closed the share sheet */
    }
  };

  const faq = [
    { q: "How do I join?", a: "Use the Join button on this page or in My Webinars. The room opens 15 minutes before the start; the link also comes on WhatsApp and email." },
    { q: "Will it be recorded?", a: w.recording ? `Yes. Registered attendees can watch it${w.recording.expiresInDays ? ` for ${w.recording.expiresInDays} days` : ""} after it ends.` : "No, this one is live only." },
    ...(w.price > 0 ? [{ q: "Can I get a refund?", a: "Full refund if the webinar is cancelled. For other requests, contact us at least 24 hours before the start." }] : []),
    { q: "Do I get a certificate?", a: w.certificate.offered ? `Yes — attend at least ${w.certificate.minAttendancePct}% live${w.certificate.requiresQuiz ? " and pass a short quiz" : ""}. Watching the recording doesn't count.` : "This session doesn't include a certificate." },
  ];

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/35 blur-[110px]" aria-hidden />
        <div className="container-x relative pb-16 pt-8 sm:pb-24">
          <div className="flex items-center justify-between">
            <Link href="/webinars" className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-white/60 transition hover:text-white">
              <ChevronLeft className="h-4 w-4" /> All webinars
            </Link>
            <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <Reveal>
              <div className="flex flex-wrap gap-2">
                {now ? <Badge tone={statusBadge(w, now).tone}>{statusBadge(w, now).label}</Badge> : <Skeleton className="h-6 w-20 bg-white/10" />}
                <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80">{TOPIC_LABEL[w.topic]}</span>
                <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80">{inr(w.price)}</span>
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">{w.title}</h1>
              <p className="mt-5 max-w-xl text-lg text-white/65">{w.subtitle}</p>
              <dl className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map(([I, label, text]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur">
                    <I className="h-4 w-4 text-brand-200" />
                    <dt className="mt-2 text-[11px] uppercase tracking-wider text-white/40">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium">{text}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {speakers.map((s) => (
                    <Avatar key={s!.id} name={s!.name} photo={s!.photo} size={36} />
                  ))}
                </div>
                <p className="text-sm text-white/60">with {speakers.map((s) => s!.name).join(" & ")}</p>
              </div>
            </Reveal>
            <Parallax offset={16}>
              <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <WebinarCover topic={w.topic} className={cx("aspect-[16/10] w-full", w.state === "cancelled" && "grayscale")} />
              </div>
            </Parallax>
          </div>
        </div>
      </section>

      {/* body */}
      <div className="container-x grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div className="order-2 space-y-16 lg:order-1">
          <Reveal as="section">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">About this session</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-3">{w.description}</p>
            {w.outcomes.length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {w.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-medium text-ink transition hover:border-brand-200">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Check className="h-3.5 w-3.5" /></span>
                    {o}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          {w.sessions.length > 1 && (
            <Reveal as="section">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Sessions</h2>
              <p className="mt-2 text-ink-3">Attendance counts across the whole series.</p>
              <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                {w.sessions.map((s, i) => {
                  const done = now > 0 && now > t(s.startsAt) + s.durationMin * 60_000;
                  const live = now > 0 && now >= t(s.startsAt) && !done;
                  return (
                    <li key={s.id} className={cx("rounded-2xl border p-5 transition", live ? "border-red-200 bg-red-50/40" : "border-line bg-white")}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-700">Day {i + 1}</span>
                        {live && <Badge tone="red">Live</Badge>}
                        {done && <Badge tone="gray">Done</Badge>}
                      </div>
                      <p className="mt-2 font-semibold text-ink">{s.title}</p>
                      <p className="mt-1 text-sm text-ink-3">
                        {now ? `${fmtDate(s.startsAt)}, ${fmtTime(s.startsAt)}` : "—"} · {fmtDuration(s.durationMin)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          )}

          <Reveal as="section">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Agenda</h2>
            <ol className="relative mt-8 space-y-6 border-l-2 border-line pl-8">
              {w.agenda.map((a, i) => (
                <motion.li
                  key={a}
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="absolute -left-[42px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-[11px] font-semibold text-white shadow-[var(--shadow-glow)]">{i + 1}</span>
                  <p className="text-lg font-medium text-ink">{a}</p>
                </motion.li>
              ))}
            </ol>
          </Reveal>

          {(w.audience.length > 0 || w.prerequisites.length > 0) && (
            <Reveal as="section" className="grid gap-5 sm:grid-cols-2">
              {w.audience.length > 0 && <ListBlock title="Who it's for" items={w.audience} />}
              {w.prerequisites.length > 0 && <ListBlock title="Before you join" items={w.prerequisites} />}
            </Reveal>
          )}

          <Reveal as="section">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{speakers.length > 1 ? "Your hosts" : "Your host"}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {speakers.map((s) => (
                <li key={s!.id} className="group flex gap-4 rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
                  <span className="transition-transform duration-300 group-hover:scale-105">
                    <Avatar name={s!.name} photo={s!.photo} size={60} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{s!.name}</p>
                    <p className="text-sm text-brand-700">{s!.role}</p>
                    <p className="mt-1.5 text-sm text-ink-3">{s!.bio}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Good to know</h2>
            <Accordion items={faq} />
          </Reveal>
        </div>

        <aside className="order-1 space-y-5 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          {now ? <ActionPanel w={w} now={now} reg={reg} onRegister={() => setModal("register")} onWaitlist={() => setModal("waitlist")} /> : <Skeleton className="h-72 w-full rounded-3xl" />}
          <div className="rounded-3xl border border-line bg-white p-6">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Award className="h-5 w-5 text-brand-600" /> Certificate
            </p>
            <p className="mt-1.5 text-sm text-ink-3">
              {w.certificate.offered ? `Attend ${w.certificate.minAttendancePct}%+ live${w.certificate.requiresQuiz ? " and pass the quiz" : ""}.` : "Not included for this session."}
            </p>
            <Link href="/webinars/verify" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:underline">
              Verify a certificate
            </Link>
          </div>
          <RelatedCourse webinar={w} />
          <button onClick={() => openContactPopup("Webinar")} className="flex w-full items-center justify-between rounded-3xl border border-dashed border-line px-6 py-5 text-left text-sm text-ink-3 transition hover:border-brand-300 hover:text-ink">
            <span>
              <span className="block font-semibold text-ink">Have a question?</span>
              Talk to our team
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </span>
          </button>
        </aside>
      </div>

      <RegisterModal webinar={w} open={modal !== null} waitlist={modal === "waitlist"} onClose={() => setModal(null)} />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function ActionPanel({
  w,
  now,
  reg,
  onRegister,
  onWaitlist,
}: {
  w: Webinar;
  now: number;
  reg: WebinarRegistration | null;
  onRegister: () => void;
  onWaitlist: () => void;
}) {
  const user = useCurrentUser();
  const [cancelling, setCancelling] = useState(false);
  const st = webinarStatus(w, now);
  const avail = registrationAvailability(w, now);
  const jw = joinWindow(w, now);
  const left = seatsLeft(w);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const cancel = async () => {
    if (!confirm(reg?.amountPaid ? "Cancel your seat? Refunds for paid webinars are handled by our team within 5–7 working days." : "Cancel your registration?")) return;
    setCancelling(true);
    await api.cancelRegistration(w.id, user ? { id: user.id, email: user.email } : { id: "guest" });
    setCancelling(false);
    toast.success("Registration cancelled");
  };

  // Cancelled ───────────────────────────────────────────────
  if (st === "cancelled") {
    return (
      <Card className="rounded-3xl p-7">
        <Badge tone="red">Cancelled</Badge>
        <p className="mt-3 font-semibold text-ink">This webinar won&apos;t take place.</p>
        {w.cancelReason && <p className="mt-1 text-sm text-ink-3">{w.cancelReason}</p>}
        {reg && reg.amountPaid > 0 && (
          <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Your ₹{reg.amountPaid} will be refunded to the original payment method within 5–7 working days.</p>
        )}
        {reg && <p className="mt-3 text-sm text-ink-3">We&apos;ll message you when a new date is announced.</p>}
        <Button href="/webinars" variant="secondary" className="mt-5 w-full">See other webinars</Button>
      </Card>
    );
  }

  // Ended ───────────────────────────────────────────────────
  if (st === "ended") {
    const rec = recordingState(w, now, reg);
    const cert = certificateState(w, now, reg);
    const exp = recordingExpiresAt(w);
    return (
      <Card className="rounded-3xl p-7">
        <p className="text-sm text-ink-3">Ended on {fmtDateLong(endOf(w))}</p>
        <div className="mt-4 rounded-xl border border-line p-4">
          <p className="flex items-center gap-2 font-semibold text-ink"><PlayCircle size={18} className="text-brand-600" /> Recording</p>
          <p className="mt-1 text-sm text-ink-3">
            {rec === "available" && (exp ? `Available until ${fmtDate(exp)}.` : "Available anytime.")}
            {rec === "processing" && "Being processed. It'll be ready within 24 hours of the session."}
            {rec === "expired" && "This recording is no longer available."}
            {rec === "not-recorded" && "This session wasn't recorded."}
            {rec === "locked" && "Only people who registered can watch this recording."}
          </p>
          {rec === "available" && <Button href={`/webinars/${w.slug}/recording`} className="mt-3 w-full">Watch recording</Button>}
          {rec === "locked" && !user && <Button href="/login" variant="secondary" className="mt-3 w-full">Log in if you registered</Button>}
        </div>
        {w.certificate.offered && (
          <div className="mt-3 rounded-xl border border-line p-4">
            <p className="flex items-center justify-between gap-2 font-semibold text-ink">
              <span className="flex items-center gap-2"><Award size={18} className="text-brand-600" /> Certificate</span>
              <Badge tone={CERT_COPY[cert].tone === "red" ? "gray" : CERT_COPY[cert].tone}>{CERT_COPY[cert].label}</Badge>
            </p>
            <p className="mt-1 text-sm text-ink-3">{CERT_COPY[cert].text(w)}</p>
            {reg && (cert === "eligible" || cert === "quiz-pending") && (
              <Button href={user ? "/dashboard/webinar-certificates" : "/login"} className="mt-3 w-full">
                {!user ? "Log in to download" : cert === "eligible" ? "Download certificate" : "Take the quiz"}
              </Button>
            )}
          </div>
        )}
        <Button href="/webinars" variant="ghost" className="mt-3 w-full">See upcoming webinars</Button>
      </Card>
    );
  }

  // Registered ──────────────────────────────────────────────
  if (reg && !reg.waitlisted) {
    const next = jw.session;
    return (
      <Card className="rounded-3xl p-7">
        <Badge tone="green">You&apos;re registered</Badge>
        {st === "live" ? (
          <p className="mt-3 text-lg font-bold text-red-600">Live now</p>
        ) : (
          next && (
            <>
              <p className="mt-3 text-sm text-ink-3">{w.sessions.length > 1 ? `Next: ${next.title}` : "Starts"}</p>
              <p className="text-lg font-bold text-ink">{fmtDate(next.startsAt)}, {fmtTime(next.startsAt)} IST</p>
              <p className="text-sm text-brand-700">{countdown(t(next.startsAt) - now)}</p>
            </>
          )
        )}
        {w.state === "postponed" && w.rescheduledFrom && <Postponed w={w} />}
        <Button href={`/webinars/${w.slug}/live`} disabled={!jw.open} size="lg" className="mt-5 w-full" variant={st === "live" ? "blue" : "primary"}>
          <Video size={18} /> {jw.open ? "Join webinar" : `Room opens at ${fmtTime(jw.opensAt!)}`}
        </Button>
        {!jw.open && <p className="mt-2 text-center text-xs text-ink-3">The room opens 15 minutes before start.</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={() => downloadIcs(w, origin)}><CalendarPlus size={15} /> Calendar</Button>
          <a href={googleCalendarUrl(w, origin)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface">Google Cal</a>
        </div>
        <p className="mt-4 border-t border-line pt-4 text-xs text-ink-3">
          Registered as {reg.name} · {reg.email}
          {reg.amountPaid > 0 && ` · Paid ₹${reg.amountPaid}`}
        </p>
        {(st === "upcoming" || st === "starting-soon") && (
          <button onClick={cancel} disabled={cancelling} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
            {cancelling && <Loader2 size={12} className="animate-spin" />} Cancel registration
          </button>
        )}
      </Card>
    );
  }

  // Waitlisted ──────────────────────────────────────────────
  if (reg?.waitlisted) {
    return (
      <Card className="rounded-3xl p-7">
        <Badge tone="amber">On the waitlist</Badge>
        <p className="mt-3 font-semibold text-ink">We&apos;ll tell you if a seat opens.</p>
        <p className="mt-1 text-sm text-ink-3">You&apos;ll get an email and WhatsApp message. Seats go in the order people joined the waitlist.</p>
        {w.recording?.access === "public" && <p className="mt-3 text-sm text-ink-3">This one&apos;s recording will be public, so you won&apos;t miss out.</p>}
        <button onClick={cancel} disabled={cancelling} className="mt-4 text-xs font-medium text-red-600 hover:underline">Leave waitlist</button>
      </Card>
    );
  }

  // Not registered ──────────────────────────────────────────
  const pct = Math.min(100, Math.round((w.registeredCount / w.capacity) * 100));
  return (
    <Card className="rounded-3xl p-7">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-ink">{inr(w.price)}</span>
        {w.originalPrice && <span className="text-ink-3 line-through">₹{w.originalPrice}</span>}
      </div>
      {st === "live" ? (
        <p className="mt-1 text-sm font-semibold text-red-600">Live now · started {fmtTime(w.sessions[0].startsAt)}</p>
      ) : st === "between-sessions" ? (
        <p className="mt-1 text-sm text-ink-3">Day 1 is done. {jw.session && `Next session ${fmtDate(jw.session.startsAt)}.`}</p>
      ) : (
        <p className="mt-1 text-sm text-ink-3">
          {fmtDate(w.sessions[0].startsAt)}, {fmtTime(w.sessions[0].startsAt)} IST · <span className="text-brand-700">{countdown(startOf(w) - now)}</span>
        </p>
      )}
      {w.state === "postponed" && w.rescheduledFrom && <Postponed w={w} />}

      <div className="mt-5">
        <div className="flex justify-between text-xs text-ink-3">
          <span className="inline-flex items-center gap-1"><Users size={13} /> {w.registeredCount} registered</span>
          <span className={cx(left <= 30 && "font-semibold text-amber-700")}>{left === 0 ? "Full" : `${left} seats left`}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
          <div className={cx("h-full rounded-full", left === 0 ? "bg-amber-500" : "bg-brand-600")} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {avail.kind === "open" && (
        <Button size="lg" className="mt-5 w-full" onClick={onRegister} variant={st === "live" ? "blue" : "primary"}>
          {st === "live" ? "Register & join now" : w.price ? `Book your seat · ${inr(w.price)}` : "Register for free"}
        </Button>
      )}
      {avail.kind === "waitlist" && (
        <>
          <Button size="lg" variant="secondary" className="mt-5 w-full" onClick={onWaitlist}>Join the waitlist</Button>
          <p className="mt-2 text-center text-xs text-ink-3">All seats are taken. No payment until a seat is confirmed.</p>
        </>
      )}
      {avail.kind === "closed" && <p className="mt-5 rounded-lg bg-surface p-3 text-center text-sm text-ink-2">{avail.reason}</p>}

      {w.certificate.offered && <p className="mt-4 flex items-center gap-2 text-sm text-ink-3"><Award size={15} className="text-brand-600" /> Participation certificate included</p>}
    </Card>
  );
}

function Postponed({ w }: { w: Webinar }) {
  return (
    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      Moved from <span className="line-through">{fmtDate(w.rescheduledFrom!)}</span> to <strong>{fmtDate(w.sessions[0].startsAt)}</strong>. Existing registrations carry over.
    </p>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6">
      <h3 className="font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-2">
            <Check size={16} className="mt-0.5 shrink-0 text-brand-600" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
