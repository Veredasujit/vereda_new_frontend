"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Lock, Pause, Play } from "lucide-react";
import * as api from "@/webinars/lib/api";
import { useCurrentUser, useNow, useRegistration } from "@/webinars/lib/hooks";
import { fmtDate, fmtDuration, recordingExpiresAt, recordingState, webinarStatus } from "@/webinars/lib/utils";
import WebinarCover from "@/webinars/components/WebinarCover";
import RelatedCourse from "@/webinars/components/RelatedCourse";
import WebinarNotFound from "@/webinars/components/WebinarNotFound";
import { Button, Card, Skeleton, cx } from "@/webinars/components/ui";

const toSec = (at: string) => at.split(":").reduce((a, p) => a * 60 + Number(p), 0);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function RecordingPage() {
  const { slug } = useParams<{ slug: string }>();
  const w = api.getWebinarBySlug(slug);
  const now = useNow(60_000);
  const reg = useRegistration(w?.id);
  const user = useCurrentUser();
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const totalSec = (w?.recording?.durationMin ?? 0) * 60;

  // dummy playback clock
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => Math.min(p + 1, totalSec)), 1000);
    return () => clearInterval(id);
  }, [playing, totalSec]);
  useEffect(() => {
    if (playing && pos >= totalSec) setPlaying(false);
  }, [playing, pos, totalSec]);

  if (!w) return <WebinarNotFound />;
  if (!now) return <div className="mx-auto max-w-5xl px-4 py-10"><Skeleton className="aspect-video w-full rounded-2xl" /></div>;

  const state = recordingState(w, now, reg);
  const back = (
    <Link href={`/webinars/${w.slug}`} className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
      <ChevronLeft size={16} /> Webinar details
    </Link>
  );

  if (state !== "available") {
    const copy: Record<string, [string, string]> = {
      "after-webinar": ["Not yet", webinarStatus(w, now) === "live" ? "The webinar is live right now — join it instead." : "The recording is published after the webinar ends."],
      "not-recorded": ["No recording", "This session wasn't recorded."],
      processing: ["Almost ready", "The recording is being processed and will be up within 24 hours."],
      expired: ["Recording expired", "This recording is no longer available."],
      locked: ["For registered attendees", user ? "This account didn't register for this webinar." : "Log in with the account you registered with."],
      cancelled: ["Webinar cancelled", "There's no recording for a cancelled webinar."],
    };
    const [title, text] = copy[state];
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        {back}
        <Card className="mt-6 p-8 text-center">
          {state === "locked" && <Lock className="mx-auto text-ink-3" size={32} />}
          <p className="mt-2 text-xs font-medium text-brand-600">{w.title}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-ink-3">{text}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {state === "after-webinar" && webinarStatus(w, now) === "live" && <Button href={`/webinars/${w.slug}/live`}>Join live</Button>}
            {state === "locked" && !user && <Button href="/login">Log in</Button>}
            <Button href="/webinars" variant="secondary">All webinars</Button>
          </div>
        </Card>
      </div>
    );
  }

  const rec = w.recording!;
  const total = rec.durationMin * 60;
  const exp = recordingExpiresAt(w);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {back}
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* dummy player — swap for <video> / YouTube embed from backend */}
          <div className="overflow-hidden rounded-2xl border border-line bg-black">
            <div className="relative aspect-video">
              <WebinarCover topic={w.topic} className="h-full w-full opacity-60" />
              <button onClick={() => setPlaying(!playing)} className="absolute inset-0 flex items-center justify-center" aria-label={playing ? "Pause" : "Play"}>
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg">{playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}</span>
              </button>
            </div>
            <div className="flex items-center gap-3 bg-gray-900 px-4 py-2.5 text-xs text-gray-300">
              <span className="font-mono">{clock(pos)}</span>
              <input type="range" min={0} max={total} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="flex-1 accent-blue-500" aria-label="Seek" />
              <span className="font-mono">{clock(total)}</span>
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink">{w.title}</h1>
          <p className="mt-1 text-sm text-ink-3">
            Recorded {fmtDate(w.sessions[0].startsAt)} · {fmtDuration(rec.durationMin)}
            {exp && ` · available until ${fmtDate(exp)}`}
          </p>
          <p className="mt-3 max-w-2xl text-ink-2">{w.description}</p>
          <p className="mt-4 rounded-lg bg-surface p-3 text-sm text-ink-3">Watching the recording doesn&apos;t count toward the participation certificate.</p>
        </div>

        <aside className="space-y-6">
          <Card className="p-4">
            <p className="font-semibold text-ink">Chapters</p>
            {rec.chapters.length ? (
              <ol className="mt-2">
                {rec.chapters.map((c) => {
                  const s = toSec(c.at);
                  const active = pos >= s && rec.chapters.every((o) => toSec(o.at) <= s || toSec(o.at) > pos);
                  return (
                    <li key={c.at}>
                      <button onClick={() => { setPos(s); setPlaying(true); }} className={cx("flex w-full gap-3 rounded-lg px-2 py-2 text-left text-sm", active ? "bg-brand-50 font-semibold text-brand-800" : "text-ink-2 hover:bg-surface")}>
                        <span className="w-12 shrink-0 font-mono text-xs text-ink-3">{c.at}</span>
                        {c.title}
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-1 text-sm text-ink-3">No chapters for this recording.</p>
            )}
          </Card>
          <RelatedCourse webinar={w} />
        </aside>
      </div>
    </div>
  );
}
