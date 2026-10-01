// All webinar rules live here: status, joining window, registration, recording
// and certificate eligibility. Keep backend rules identical to these.

import type {
  CertificateState,
  RecordingState,
  Webinar,
  WebinarRegistration,
  WebinarStatus,
} from "./types";

export const JOIN_OPENS_MIN_BEFORE = 15;
export const STARTING_SOON_MIN = 60;
export const RECORDING_PROCESSING_HOURS = 24;
const TZ = "Asia/Kolkata";

// ── time helpers ──────────────────────────────────────────────────────────
export const t = (iso: string) => new Date(iso).getTime();
export const startOf = (w: Webinar) => t(w.sessions[0].startsAt);
export const endOf = (w: Webinar) => {
  const last = w.sessions[w.sessions.length - 1];
  return t(last.startsAt) + last.durationMin * 60_000;
};
export const totalMinutes = (w: Webinar) => w.sessions.reduce((a, s) => a + s.durationMin, 0);

/** The session that is live now, or the next one to start. */
export function currentOrNextSession(w: Webinar, now: number) {
  return (
    w.sessions.find((s) => now < t(s.startsAt) + s.durationMin * 60_000) ?? null
  );
}

export function webinarStatus(w: Webinar, now: number): WebinarStatus {
  if (w.state === "cancelled") return "cancelled";
  const start = startOf(w);
  if (now < start) return start - now <= STARTING_SOON_MIN * 60_000 ? "starting-soon" : "upcoming";
  const live = w.sessions.some((s) => now >= t(s.startsAt) && now < t(s.startsAt) + s.durationMin * 60_000);
  if (live) return "live";
  if (now < endOf(w)) return "between-sessions";
  return "ended";
}

export const isPast = (s: WebinarStatus) => s === "ended";
export const isOpenStatus = (s: WebinarStatus) =>
  s === "upcoming" || s === "starting-soon" || s === "live" || s === "between-sessions";

/** Join button is enabled from 15 min before a session until it ends. */
export function joinWindow(w: Webinar, now: number) {
  const s = currentOrNextSession(w, now);
  if (!s || w.state === "cancelled") return { open: false, session: null, opensAt: null as number | null };
  const opensAt = t(s.startsAt) - JOIN_OPENS_MIN_BEFORE * 60_000;
  return { open: now >= opensAt, session: s, opensAt };
}

export const seatsLeft = (w: Webinar) => Math.max(0, w.capacity - w.registeredCount);
export const isSoldOut = (w: Webinar) => seatsLeft(w) === 0;

export type RegistrationAvailability =
  | { kind: "open" }
  | { kind: "waitlist" }
  | { kind: "closed"; reason: string };

export function registrationAvailability(w: Webinar, now: number): RegistrationAvailability {
  const st = webinarStatus(w, now);
  if (st === "cancelled") return { kind: "closed", reason: "This webinar was cancelled." };
  if (st === "ended") return { kind: "closed", reason: "This webinar has ended." };
  if ((st === "live" || st === "between-sessions") && !w.lateRegistration)
    return { kind: "closed", reason: "Registration closed when the webinar started." };
  if (isSoldOut(w)) return w.waitlist ? { kind: "waitlist" } : { kind: "closed", reason: "All seats are taken." };
  return { kind: "open" };
}

// ── recording ─────────────────────────────────────────────────────────────
export function recordingState(w: Webinar, now: number, reg?: WebinarRegistration | null): RecordingState {
  if (w.state === "cancelled") return "cancelled";
  if (webinarStatus(w, now) !== "ended") return "after-webinar";
  if (!w.recording) return "not-recorded";
  if (!w.recording.ready) return "processing";
  if (w.recording.expiresInDays !== null && now > endOf(w) + w.recording.expiresInDays * 86_400_000) return "expired";
  if (w.recording.access === "registered" && (!reg || reg.waitlisted)) return "locked";
  return "available";
}

export function recordingExpiresAt(w: Webinar): number | null {
  if (!w.recording || w.recording.expiresInDays === null) return null;
  return endOf(w) + w.recording.expiresInDays * 86_400_000;
}

// ── certificate ───────────────────────────────────────────────────────────
export function certificateState(w: Webinar, now: number, reg?: WebinarRegistration | null): CertificateState {
  if (!w.certificate.offered) return "not-offered";
  if (w.state === "cancelled") return "cancelled";
  if (!reg) return "not-registered";
  if (reg.waitlisted) return "waitlisted";
  if (webinarStatus(w, now) !== "ended") return "after-webinar";
  if (reg.attendancePct === undefined) {
    // attendance not yet computed by backend
    return now - endOf(w) < RECORDING_PROCESSING_HOURS * 3_600_000 ? "processing" : "missed";
  }
  if (reg.attendancePct <= 0) return "missed";
  if (reg.attendancePct < w.certificate.minAttendancePct) return "low-attendance";
  if (w.certificate.requiresQuiz && !reg.quizPassed) return "quiz-pending";
  return "eligible";
}

export const CERT_COPY: Record<CertificateState, { label: string; text: (w: Webinar) => string; tone: Tone }> = {
  "not-offered": { label: "No certificate", tone: "gray", text: () => "This webinar doesn't include a certificate." },
  "not-registered": { label: "Register to earn", tone: "gray", text: (w) => `Attend at least ${w.certificate.minAttendancePct}% live to earn a certificate.` },
  waitlisted: { label: "On waitlist", tone: "amber", text: () => "You'll be eligible once a seat is confirmed." },
  "after-webinar": { label: "After the webinar", tone: "blue", text: (w) => `Attend at least ${w.certificate.minAttendancePct}% live${w.certificate.requiresQuiz ? " and pass the quiz" : ""}.` },
  cancelled: { label: "Cancelled", tone: "red", text: () => "The webinar was cancelled." },
  processing: { label: "Processing", tone: "blue", text: () => "Attendance is being calculated. Certificates are issued within 24 hours." },
  missed: { label: "Missed", tone: "gray", text: () => "You didn't join live. Watching the recording doesn't count toward a certificate." },
  "low-attendance": { label: "Not eligible", tone: "amber", text: (w) => `You attended less than the required ${w.certificate.minAttendancePct}% of the live session.` },
  "quiz-pending": { label: "Quiz pending", tone: "amber", text: () => "Pass the short quiz to unlock your certificate." },
  eligible: { label: "Ready", tone: "green", text: () => "Your certificate is ready to download." },
};

/** Deterministic certificate ID from webinar + email (backend should store its own). */
export function certificateId(w: Webinar, email: string) {
  const key = (w.slug.split("-")[0] || "WEB").slice(0, 5).toUpperCase();
  let h = 2166136261;
  for (const c of `${w.id}:${email.toLowerCase()}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const code = (h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `VDL-WB-${key}-${code}`;
}

// ── status copy ───────────────────────────────────────────────────────────
export type Tone = "gray" | "blue" | "green" | "amber" | "red" | "dark";

export function statusBadge(w: Webinar, now: number): { label: string; tone: Tone } {
  const st = webinarStatus(w, now);
  if (st === "cancelled") return { label: "Cancelled", tone: "red" };
  if (st === "live") return { label: "Live now", tone: "red" };
  if (st === "between-sessions") return { label: "In progress", tone: "blue" };
  if (st === "ended") return { label: "Ended", tone: "gray" };
  if (w.state === "postponed") return { label: "Rescheduled", tone: "amber" };
  if (isSoldOut(w)) return { label: w.waitlist ? "Full · Waitlist" : "Full", tone: "amber" };
  if (st === "starting-soon") return { label: "Starting soon", tone: "blue" };
  return { label: "Upcoming", tone: "blue" };
}

// ── formatting (always IST) ──────────────────────────────────────────────
const fmt = (iso: string | number, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));

export const fmtDate = (iso: string | number) => fmt(iso, { weekday: "short", day: "numeric", month: "short" });
export const fmtDateLong = (iso: string | number) => fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const fmtTime = (iso: string | number) => fmt(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
export const fmtDay = (iso: string | number) => fmt(iso, { day: "numeric" });
export const fmtMonth = (iso: string | number) => fmt(iso, { month: "short" }).toUpperCase();
export const inr = (n: number) => (n === 0 ? "Free" : `₹${n.toLocaleString("en-IN")}`);

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}

/** "in 3 days", "in 2 hr 10 min", "in 40 min", "12:04" (last hour) */
export function countdown(ms: number) {
  if (ms <= 0) return "now";
  const min = Math.floor(ms / 60_000);
  if (min >= 2 * 24 * 60) return `in ${Math.round(min / (24 * 60))} days`;
  if (min >= 24 * 60) return "tomorrow";
  if (min >= 60) return `in ${Math.floor(min / 60)} hr ${min % 60} min`;
  return `in ${min} min`;
}

export function relativePast(ms: number) {
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min ago`;
  if (min < 24 * 60) return `${Math.floor(min / 60)} hr ago`;
  const d = Math.floor(min / (24 * 60));
  return d === 1 ? "yesterday" : `${d} days ago`;
}

// ── calendar ──────────────────────────────────────────────────────────────
const icsDate = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl(w: Webinar, origin: string) {
  const s = w.sessions[0];
  const start = t(s.startsAt);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: w.title,
    dates: `${icsDate(start)}/${icsDate(start + s.durationMin * 60_000)}`,
    details: `${w.subtitle}\n\nJoin from: ${origin}/webinars/${w.slug}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function downloadIcs(w: Webinar, origin: string) {
  const events = w.sessions
    .map((s) => {
      const start = t(s.startsAt);
      return [
        "BEGIN:VEVENT",
        `UID:${w.id}-${s.id}@vereda.co.in`,
        `DTSTAMP:${icsDate(Date.now())}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(start + s.durationMin * 60_000)}`,
        `SUMMARY:${w.title}${w.sessions.length > 1 ? ` — ${s.title}` : ""}`,
        `DESCRIPTION:Join from ${origin}/webinars/${w.slug}`,
        `URL:${origin}/webinars/${w.slug}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        "DESCRIPTION:Webinar starts in 15 minutes",
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");
  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Vereda//Webinars//EN\r\n${events}\r\nEND:VCALENDAR`;
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${w.slug}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── pricing ───────────────────────────────────────────────────────────────
// Dummy coupons. Backend must validate; never trust client totals.
const COUPONS: Record<string, { pct: number; label: string }> = {
  WEB50: { pct: 50, label: "50% off" },
  VEREDASTUDENT: { pct: 100, label: "Free for Vereda students" },
};

export function quote(w: Webinar, code: string) {
  const c = code.trim().toUpperCase();
  if (!c || w.price === 0) return { subtotal: w.price, discount: 0, total: w.price, applied: null as string | null, error: null as string | null };
  const coupon = COUPONS[c];
  if (!coupon) return { subtotal: w.price, discount: 0, total: w.price, applied: null, error: "This code isn't valid for this webinar." };
  const discount = Math.round((w.price * coupon.pct) / 100);
  return { subtotal: w.price, discount, total: w.price - discount, applied: `${c} · ${coupon.label}`, error: null };
}

// ── validation ────────────────────────────────────────────────────────────
export function validateRegistration(v: { name: string; email: string; phone: string }) {
  const e: Partial<Record<"name" | "email" | "phone", string>> = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = "Enter your full name — it goes on your certificate.";
  else if (name.length > 60) e.name = "Keep the name under 60 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  const digits = v.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(digits)) e.phone = "Enter a 10-digit Indian mobile number.";
  return e;
}

/** Standard PDF fonts only print Latin characters; strips everything else. */
export function pdfSafe(text: string) {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").trim();
}
