"use client";

// Live room. Backend later supplies the stream (YouTube Live / Zoom / Meet embed
// URL per session) and records attendance with join/leave heartbeats.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Hand, LogOut, MessageSquare, Send, Users } from "lucide-react";
import * as api from "@/webinars/lib/api";
import { useCurrentUser, useNow, useRegistration } from "@/webinars/lib/hooks";
import { fmtDate, fmtTime, joinWindow, registrationAvailability, t, webinarStatus } from "@/webinars/lib/utils";
import RegisterModal from "@/webinars/components/RegisterModal";
import WebinarNotFound from "@/webinars/components/WebinarNotFound";
import { Avatar, Button, Card, Skeleton, cx } from "@/webinars/components/ui";

const SEED_CHAT = [
  { who: "Aman", text: "Audio is clear" },
  { who: "Sneha", text: "Will the code be shared after?" },
  { who: "Vereda Team", text: "Yes — the repo link goes out with the recording.", host: true },
  { who: "Rahul", text: "Joining from Patna!" },
];

export default function LiveRoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const w = api.getWebinarBySlug(slug);
  const now = useNow(1000);
  const reg = useRegistration(w?.id);
  const [modal, setModal] = useState(false);

  if (!w) return <WebinarNotFound />;
  if (!now) return <div className="mx-auto max-w-5xl px-4 py-10"><Skeleton className="aspect-video w-full rounded-2xl" /></div>;

  const st = webinarStatus(w, now);
  const jw = joinWindow(w, now);
  const back = (
    <Link href={`/webinars/${w.slug}`} className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
      <ChevronLeft size={16} /> Webinar details
    </Link>
  );

  const gate = (title: string, text: string, action?: React.ReactNode) => (
    <div className="mx-auto max-w-xl px-4 py-10">
      {back}
      <Card className="mt-6 p-8 text-center">
        <p className="text-xs font-medium text-brand-600">{w.title}</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-3">{text}</p>
        {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
      </Card>
      <RegisterModal webinar={w} open={modal} onClose={() => setModal(false)} />
    </div>
  );

  if (st === "cancelled") return gate("This webinar was cancelled", w.cancelReason ?? "It won't take place.", <Button href="/webinars">Other webinars</Button>);
  if (st === "ended")
    return gate(
      "This webinar has ended",
      "The live room is closed. Registered attendees can watch the recording.",
      <><Button href={`/webinars/${w.slug}/recording`}>Go to recording</Button><Button href="/webinars" variant="secondary">Upcoming webinars</Button></>,
    );
  if (!reg) {
    const avail = registrationAvailability(w, now);
    return gate(
      "Register to join",
      avail.kind === "open" ? "The room is for registered attendees. It takes 30 seconds." : avail.kind === "waitlist" ? "All seats are taken. Join the waitlist on the webinar page." : avail.reason,
      avail.kind === "open" ? <Button onClick={() => setModal(true)}>Register {w.price ? `· ₹${w.price}` : "free"}</Button> : <Button href={`/webinars/${w.slug}`}>Back to webinar</Button>,
    );
  }
  if (reg.waitlisted) return gate("You're on the waitlist", "You can join once a seat is confirmed. We'll message you.", <Button href={`/webinars/${w.slug}`}>Back</Button>);
  if (!jw.open && jw.session) {
    const ms = jw.opensAt! - now;
    const hh = Math.floor(ms / 3_600_000);
    const mm = Math.floor((ms % 3_600_000) / 60_000);
    const ss = Math.floor((ms % 60_000) / 1000);
    return gate(
      ms < 3_600_000 ? `Room opens in ${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : `Room opens ${fmtDate(jw.opensAt!)}, ${fmtTime(jw.opensAt!)}`,
      `${jw.session.title} starts at ${fmtTime(jw.session.startsAt)} IST.${hh >= 1 ? " Keep this page open or come back later." : " This page opens the room automatically."}`,
      <Button href={`/webinars/${w.slug}`} variant="secondary">Back to details</Button>,
    );
  }

  return <Room w={w} now={now} sessionTitle={jw.session?.title} startsAt={jw.session ? t(jw.session.startsAt) : 0} />;
}

function Room({ w, now, sessionTitle, startsAt }: { w: NonNullable<ReturnType<typeof api.getWebinarBySlug>>; now: number; sessionTitle?: string; startsAt: number }) {
  const user = useCurrentUser();
  const router = useRouter();
  const [chat, setChat] = useState(SEED_CHAT);
  const [msg, setMsg] = useState("");
  const [hand, setHand] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const started = now >= startsAt;
  const speaker = api.getSpeaker(w.speakerIds[0]);

  useEffect(() => endRef.current?.scrollIntoView({ block: "nearest" }), [chat]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = msg.trim().slice(0, 300);
    if (!text) return;
    setChat((c) => [...c, { who: user?.name ?? "You", text }]);
    setMsg("");
  };

  return (
    <div className="bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 text-white">
          <div className="min-w-0">
            <p className="truncate font-semibold">{w.title}</p>
            <p className="text-xs text-ink-3">{sessionTitle} · {started ? <span className="font-semibold text-red-400">LIVE</span> : "Starting soon"}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push(`/webinars/${w.slug}`)}>
            <LogOut size={15} /> Leave
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gray-900">
              {started ? (
                <div className="text-center text-gray-300">
                  <Avatar name={speaker?.name ?? "Host"} photo={speaker?.photo} size={96} />
                  <p className="mt-3 font-semibold text-white">{speaker?.name}</p>
                  <p className="text-sm">Live stream appears here once the backend provides the embed URL.</p>
                </div>
              ) : (
                <div className="text-center text-gray-300">
                  <p className="text-lg font-semibold text-white">Waiting for the host…</p>
                  <p className="text-sm">We start at {fmtTime(startsAt)} IST.</p>
                </div>
              )}
              {started && <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">LIVE</span>}
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white"><Users size={12} /> {Math.min(w.registeredCount, 120 + (Math.floor(now / 60_000) % 40))}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={() => setHand(!hand)} className={cx("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium", hand ? "bg-amber-400 text-ink" : "bg-gray-800 text-white hover:bg-gray-700")}>
                <Hand size={16} /> {hand ? "Hand raised" : "Raise hand"}
              </button>
              {w.certificate.offered && (
                <p className="text-xs text-ink-3">Stay for at least {w.certificate.minAttendancePct}% of the session to earn your certificate.</p>
              )}
            </div>
          </div>

          <div className="flex h-[420px] flex-col rounded-xl bg-white lg:h-auto">
            <p className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm font-semibold text-ink"><MessageSquare size={16} /> Chat & questions</p>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
              {chat.map((c, i) => (
                <p key={i}>
                  <span className={cx("font-semibold", "host" in c && c.host ? "text-brand-700" : "text-ink")}>{c.who}</span>{" "}
                  <span className="text-ink-2">{c.text}</span>
                </p>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={300} placeholder="Ask a question…" className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-500" />
              <button className="rounded-lg bg-gray-900 px-3 text-white disabled:opacity-40" disabled={!msg.trim()} aria-label="Send"><Send size={16} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
