"use client";
import { DashboardPageHeader } from "@/app/dashboard/DashboardClientLayout";
import { CountUp } from "@/ui";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Award, CalendarPlus, PlayCircle, Video } from "lucide-react";
import * as api from "@/webinars/lib/api";
import { useCurrentUser, useMyRegistrations, useNow } from "@/webinars/lib/hooks";
import type { Webinar, WebinarRegistration } from "@/webinars/lib/types";
import {
  CERT_COPY,
  certificateState,
  countdown,
  downloadIcs,
  endOf,
  fmtDate,
  fmtTime,
  joinWindow,
  recordingState,
  relativePast,
  startOf,
  statusBadge,
  webinarStatus,
} from "@/webinars/lib/utils";
import WebinarCover from "@/webinars/components/WebinarCover";
import { Badge, Button, EmptyState, Skeleton, cx } from "@/webinars/components/ui";

type Row = { w: Webinar; r: WebinarRegistration };

export default function MyWebinarsPage() {
  const user = useCurrentUser();
  const now = useNow(15_000);
  const regs = useMyRegistrations();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  // DEMO: give the account a history so every state is visible. Remove with backend.
  useEffect(() => {
    if (user) api.seedDemoHistory({ id: user.id, name: user.name, email: user.email, phone: user.phone });
  }, [user]);

  const rows: Row[] = useMemo(
    () => regs.map((r) => ({ r, w: api.getWebinarById(r.webinarId)! })).filter((x) => x.w),
    [regs],
  );
  const upcoming = rows
    .filter(({ w }) => now && webinarStatus(w, now) !== "ended")
    .sort((a, b) => startOf(a.w) - startOf(b.w));
  const past = rows
    .filter(({ w }) => now && webinarStatus(w, now) === "ended")
    .sort((a, b) => endOf(b.w) - endOf(a.w));
  const ready = rows.filter(({ w, r }) => now && certificateState(w, now, r) === "eligible").length;
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-8">
      <DashboardPageHeader title="My Webinars" subtitle="Join live, rewatch, and collect certificates." action={<Button href="/webinars" variant="secondary">Browse webinars</Button>} />

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Upcoming", upcoming.filter(({ r }) => !r.waitlisted).length],
          ["Attended", past.filter(({ r }) => (r.attendancePct ?? 0) > 0).length],
          ["Certificates ready", ready],
        ].map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-3xl font-semibold tracking-tight text-ink">{now ? <CountUp value={String(n)} /> : "–"}</p>
            <p className="text-sm text-ink-3">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-xl border border-line bg-white p-1 sm:inline-flex">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("flex-1 rounded-lg px-4 py-2 text-sm font-medium sm:flex-none", tab === t ? "bg-gray-900 text-white" : "text-ink-3 hover:bg-surface")}>
            {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {!now ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "upcoming" ? "No upcoming webinars" : "No past webinars yet"}
          text={tab === "upcoming" ? "Register for a live session and it'll show up here with a Join button." : "Webinars you attend will appear here with recordings and certificates."}
          action={<Button href="/webinars">Find a webinar</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {list.map(({ w, r }) => (
            <WebinarRow key={w.id} w={w} r={r} now={now} />
          ))}
        </ul>
      )}

      <p className="text-xs text-ink-3">
        Demo data.{" "}
        <button
          className="underline hover:text-ink-3"
          onClick={() => {
            api.resetDemo();
            toast.success("Demo data reset — reload to reseed");
          }}
        >
          Reset
        </button>
      </p>
    </div>
  );
}

function WebinarRow({ w, r, now }: Row & { now: number }) {
  const st = webinarStatus(w, now);
  const badge = statusBadge(w, now);
  const jw = joinWindow(w, now);
  const rec = recordingState(w, now, r);
  const cert = certificateState(w, now, r);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  let when: string;
  if (st === "cancelled") when = `Was on ${fmtDate(w.sessions[0].startsAt)}`;
  else if (st === "ended") when = `Ended ${relativePast(now - endOf(w))}`;
  else if (st === "live") when = "Live now";
  else {
    const next = jw.session ?? w.sessions[0];
    when = `${fmtDate(next.startsAt)}, ${fmtTime(next.startsAt)} IST · ${countdown(new Date(next.startsAt).getTime() - now)}`;
  }

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <Link href={`/webinars/${w.slug}`} className="block w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
        <WebinarCover topic={w.topic} className={cx("aspect-video w-full", st === "cancelled" && "grayscale")} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={badge.tone}>{badge.label}</Badge>
          {r.waitlisted && <Badge tone="amber">Waitlist</Badge>}
          {st === "ended" && w.certificate.offered && <Badge tone={CERT_COPY[cert].tone === "red" ? "gray" : CERT_COPY[cert].tone}>Certificate: {CERT_COPY[cert].label}</Badge>}
        </div>
        <Link href={`/webinars/${w.slug}`} className="mt-1.5 block font-semibold text-ink hover:text-brand-700">{w.title}</Link>
        <p className={cx("text-sm", st === "live" ? "font-semibold text-red-600" : "text-ink-3")}>{when}</p>
        {st === "ended" && r.attendancePct !== undefined && <p className="text-xs text-ink-3">You attended {r.attendancePct}% live</p>}
        {st === "cancelled" && r.amountPaid > 0 && <p className="text-xs text-green-700">Refund of ₹{r.amountPaid} in process</p>}
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {st !== "ended" && st !== "cancelled" && !r.waitlisted && (
          <>
            <Button href={`/webinars/${w.slug}/live`} disabled={!jw.open} variant={st === "live" ? "blue" : "primary"} size="sm">
              <Video size={15} /> {jw.open ? "Join" : `Opens ${fmtTime(jw.opensAt!)}`}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => downloadIcs(w, origin)} aria-label="Add to calendar"><CalendarPlus size={15} /></Button>
          </>
        )}
        {st === "ended" && rec === "available" && <Button href={`/webinars/${w.slug}/recording`} variant="secondary" size="sm"><PlayCircle size={15} /> Recording</Button>}
        {st === "ended" && rec === "processing" && <span className="text-xs text-ink-3">Recording in ~24 h</span>}
        {st === "ended" && rec === "expired" && <span className="text-xs text-ink-3">Recording expired</span>}
        {st === "ended" && (cert === "eligible" || cert === "quiz-pending") && (
          <Button href="/dashboard/webinar-certificates" size="sm"><Award size={15} /> {cert === "eligible" ? "Certificate" : "Take quiz"}</Button>
        )}
        {(st === "cancelled" || r.waitlisted) && <Button href={`/webinars/${w.slug}`} variant="secondary" size="sm">Details</Button>}
      </div>
    </li>
  );
}
