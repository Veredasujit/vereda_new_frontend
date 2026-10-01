"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import type { Webinar, WebinarRegistration } from "@/webinars/lib/types";
import {
  countdown,
  endOf,
  fmtDay,
  fmtDuration,
  fmtMonth,
  fmtTime,
  inr,
  recordingState,
  relativePast,
  seatsLeft,
  startOf,
  statusBadge,
  totalMinutes,
  webinarStatus,
} from "@/webinars/lib/utils";
import * as api from "@/webinars/lib/api";
import WebinarCover from "./WebinarCover";
import { Avatar, Badge, cx } from "./ui";

export const TOPIC_LABEL: Record<Webinar["topic"], string> = {
  flutter: "Flutter",
  "ai-ml": "AI & ML",
  backend: "Backend",
  career: "Career",
};

export default function WebinarCard({ w, now, reg }: { w: Webinar; now: number; reg?: WebinarRegistration | null }) {
  const st = webinarStatus(w, now);
  const badge = statusBadge(w, now);
  const left = seatsLeft(w);
  const rec = recordingState(w, now, reg);
  const cancelled = st === "cancelled";
  const pct = Math.min(100, Math.round((w.registeredCount / w.capacity) * 100));
  const speakers = w.speakerIds.map(api.getSpeaker).filter(Boolean);

  let when: string;
  if (cancelled) when = "Cancelled";
  else if (st === "live") when = "Happening now";
  else if (st === "ended") when = `Ended ${relativePast(now - endOf(w))}`;
  else when = `Starts ${countdown(startOf(w) - now)}`;

  const [cta, suffix] = ((): [string, string] => {
    if (reg && !reg.waitlisted && (st === "live" || st === "starting-soon")) return ["Join", "/live"];
    if (st === "live") return ["Join now", "/live"];
    if (st === "ended" && rec === "available") return ["Watch", "/recording"];
    if (reg?.waitlisted) return ["Waitlisted", ""];
    if (reg) return ["Registered", ""];
    if (st === "upcoming" || st === "starting-soon") return [w.price ? "Book seat" : "Register", ""];
    return ["Details", ""];
  })();

  return (
    <article
      className={cx(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]",
        cancelled && "opacity-70",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <WebinarCover topic={w.topic} className={cx("h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]", cancelled && "grayscale")} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={badge.tone}>{badge.label}</Badge>
            {reg && !reg.waitlisted && <Badge tone="green">Registered</Badge>}
          </div>
          {/* date tile */}
          <div className="flex w-14 flex-col items-center rounded-2xl bg-white/95 py-1.5 text-ink shadow-sm backdrop-blur">
            <span className="text-[10px] font-semibold tracking-wider text-brand-600">{fmtMonth(w.sessions[0].startsAt)}</span>
            <span className={cx("text-xl font-semibold leading-none", cancelled && "line-through")}>{fmtDay(w.sessions[0].startsAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-3">
          <span className="text-brand-700">{TOPIC_LABEL[w.topic]}</span>
          <span aria-hidden>·</span>
          <span>{w.level}</span>
          <span aria-hidden>·</span>
          <span className="font-semibold text-ink">{inr(w.price)}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-ink">
          <Link href={`/webinars/${w.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {w.title}
          </Link>
        </h3>

        <div className="mt-4 flex items-center gap-4 text-sm text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {fmtTime(w.sessions[0].startsAt)} · {fmtDuration(totalMinutes(w))}
          </span>
          {w.sessions.length > 1 && <span>{w.sessions.length} sessions</span>}
        </div>

        {!cancelled && st !== "ended" && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface">
              <div className={cx("h-full rounded-full transition-all duration-700", left === 0 ? "bg-amber-500" : "bg-brand-gradient")} style={{ width: `${pct}%` }} />
            </div>
            <p className={cx("mt-1.5 flex items-center gap-1.5 text-xs", left > 0 && left <= 30 ? "font-semibold text-amber-700" : "text-ink-3")}>
              <Users className="h-3.5 w-3.5" />
              {left === 0 ? "Fully booked" : left <= 30 ? `Only ${left} seats left` : `${w.registeredCount} registered`}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {speakers.slice(0, 2).map((s) => (
                <Avatar key={s!.id} name={s!.name} photo={s!.photo} size={28} ring />
              ))}
            </div>
            <span className={cx("text-xs", st === "live" ? "font-semibold text-red-600" : "text-ink-3")}>{when}</span>
          </div>
          <Link
            href={`/webinars/${w.slug}${suffix}`}
            className="relative z-10 inline-flex items-center gap-1 rounded-full bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors group-hover:bg-ink group-hover:text-white"
          >
            {cta} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
