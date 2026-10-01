"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Award,
  BellRing,
  CalendarCheck,
  MessageSquareText,
  MousePointerClick,
  PlayCircle,
  Search,
  Sparkles,
  TicketPercent,
  Video,
  X,
} from "lucide-react";
import { listWebinars, getSpeaker } from "@/webinars/lib/api";
import { TOPICS, speakers } from "@/webinars/lib/data";
import { useMyRegistrations, useNow } from "@/webinars/lib/hooks";
import type { Webinar } from "@/webinars/lib/types";
import { endOf, fmtDate, fmtDuration, fmtTime, inr, registrationAvailability, seatsLeft, startOf, totalMinutes, webinarStatus } from "@/webinars/lib/utils";
import WebinarCard, { TOPIC_LABEL } from "@/webinars/components/WebinarCard";
import WebinarCover from "@/webinars/components/WebinarCover";
import RegisterModal from "@/webinars/components/RegisterModal";
import { Avatar } from "@/webinars/components/ui";
import { openContactPopup } from "@/contact-popup/ContactPopup";
import { Accordion, Button, CountUp, EmptyState, Eyebrow, Reveal, Section, SectionHeader, Skeleton, Stagger, StaggerItem, Tabs, cn } from "@/ui";

type TabId = "upcoming" | "past" | "all";
const TABS: { id: TabId; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past & recordings" },
  { id: "all", label: "All" },
];
const PRICES = [
  { id: "any", label: "Any price" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
] as const;

export default function WebinarsPage() {
  return (
    <Suspense fallback={<div className="container-x py-24"><Skeleton className="h-96 w-full rounded-3xl" /></div>}>
      <WebinarsLanding />
    </Suspense>
  );
}

function WebinarsLanding() {
  const now = useNow(30_000);
  const all = listWebinars();
  const [registerFor, setRegisterFor] = useState<{ w: Webinar; waitlist: boolean } | null>(null);

  // the session to promote: live first, else the soonest open one
  const next = useMemo(() => {
    if (!now) return null;
    const open = all.filter((w) => {
      const st = webinarStatus(w, now);
      return st !== "ended" && st !== "cancelled";
    });
    return open.find((w) => webinarStatus(w, now) === "live") ?? open.sort((a, b) => startOf(a) - startOf(b))[0] ?? null;
  }, [all, now]);

  const register = (w: Webinar | null) => {
    if (!w || !now) return;
    const avail = registrationAvailability(w, now);
    if (avail.kind === "closed") return openContactPopup("Webinar");
    setRegisterFor({ w, waitlist: avail.kind === "waitlist" });
  };

  return (
    <>
      <Hero next={next} now={now} onRegister={() => register(next)} />
      <StatsBand />
      <Explorer now={now} />
      <HowItWorks />
      <WhyAttend />
      <Speakers />
      <Faq />
      <FinalCta onRegister={() => register(next)} />
      <MobileCta next={next} onRegister={() => register(next)} />
      {registerFor && <RegisterModal webinar={registerFor.w} waitlist={registerFor.waitlist} open onClose={() => setRegisterFor(null)} />}
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero({ next, now, onRegister }: { next: Webinar | null; now: number; onRegister: () => void }) {
  const words = ["Learn", "live.", "Build", "faster."];
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-600/35 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-secondary/30 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-x relative grid items-center gap-14 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              Live webinars · Free & hands-on
            </span>
          </motion.div>

          <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl">
            {words.map((w, i) => (
              <motion.span
                key={w}
                className={cn("mr-[0.22em] inline-block", i >= 2 && "bg-gradient-to-r from-brand-300 to-sky-300 bg-clip-text text-transparent")}
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p className="mt-6 max-w-lg text-lg text-white/65" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            Short, practical sessions on Flutter, AI and tech careers — with mentors who ship real apps.
          </motion.p>

          <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Button size="lg" onClick={onRegister} disabled={!next}>
              Register now <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white backdrop-blur hover:border-white/40 hover:bg-white/10" onClick={() => openContactPopup("Webinar")}>
              <MessageSquareText className="h-4 w-4" /> Contact us
            </Button>
          </motion.div>

          <motion.div className="mt-10 flex items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <div className="flex -space-x-3">
              {speakers.map((s) => (
                <Avatar key={s.id} name={s.name} photo={s.photo} size={40} />
              ))}
            </div>
            <p className="text-sm text-white/60">Hosted by Vereda founders & mentors</p>
          </motion.div>
        </div>

        <NextCard w={next} now={now} onRegister={onRegister} />
      </div>
      {/* curved separator */}
      <svg className="relative block h-10 w-full text-white sm:h-16" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden>
        <path d="M0 64h1440V0C1140 44 840 64 720 64S300 44 0 0z" fill="currentColor" />
      </svg>
    </section>
  );
}

function NextCard({ w, now, onRegister }: { w: Webinar | null; now: number; onRegister: () => void }) {
  const tick = useNow(1000);
  if (!now) return <Skeleton className="h-[420px] w-full rounded-3xl bg-white/10" />;
  if (!w)
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70 backdrop-blur">
        New sessions are announced every week. <button onClick={() => openContactPopup("Webinar")} className="font-semibold text-white underline">Get notified</button>
      </div>
    );
  const st = webinarStatus(w, tick || now);
  const ms = Math.max(0, startOf(w) - (tick || now));
  const parts = [
    [Math.floor(ms / 86_400_000), "days"],
    [Math.floor((ms % 86_400_000) / 3_600_000), "hrs"],
    [Math.floor((ms % 3_600_000) / 60_000), "min"],
    [Math.floor((ms % 60_000) / 1000), "sec"],
  ] as const;
  const pct = Math.min(100, Math.round((w.registeredCount / w.capacity) * 100));
  const sp = w.speakerIds.map(getSpeaker).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative">
      {/* floating chips */}
      <span className="absolute -left-6 top-24 z-10 hidden animate-float-slow items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md sm:inline-flex">
        <MessageSquareText className="h-4 w-4 text-brand-200" /> Live Q&A
      </span>
      <span className="absolute -right-4 bottom-28 z-10 hidden animate-float-slow items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md [animation-delay:-4s] sm:inline-flex">
        <Award className="h-4 w-4 text-emerald-300" /> Certificate included
      </span>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-ink shadow-2xl">
        <div className="relative">
          <WebinarCover topic={w.topic} className="aspect-[16/8] w-full" />
          <span className={cn("absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", st === "live" ? "bg-red-600 text-white" : "bg-white/95 text-ink")}>
            {st === "live" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            {st === "live" ? "Live now" : "Next live session"}
          </span>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold text-brand-700">
            {TOPIC_LABEL[w.topic]} · {inr(w.price)}
          </p>
          <p className="mt-1.5 text-xl font-semibold leading-snug tracking-tight">{w.title}</p>
          <p className="mt-1 text-sm text-ink-3">
            {fmtDate(w.sessions[0].startsAt)} · {fmtTime(w.sessions[0].startsAt)} IST · {fmtDuration(totalMinutes(w))}
          </p>

          {st !== "live" && (
            <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Time until start">
              {parts.map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-surface py-2.5 text-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={v} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="block text-2xl font-semibold tabular-nums">
                      {String(v).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[11px] text-ink-3">{l}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface">
              <motion.div className="h-full rounded-full bg-brand-gradient" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }} />
            </div>
            <p className="mt-1.5 text-xs text-ink-3">{seatsLeft(w) === 0 ? "Fully booked — join the waitlist" : `${w.registeredCount} registered · ${seatsLeft(w)} seats left`}</p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex -space-x-2">
              {sp.map((s) => (
                <Avatar key={s!.id} name={s!.name} photo={s!.photo} size={32} ring />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" href={`/webinars/${w.slug}`}>
                Details
              </Button>
              <Button variant="dark" size="sm" onClick={onRegister}>
                {st === "live" ? "Join now" : "Reserve seat"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────
function StatsBand() {
  const all = listWebinars();
  const regs = all.reduce((a, w) => a + w.registeredCount, 0);
  const free = Math.round((all.filter((w) => w.price === 0).length / all.length) * 100);
  const stats = [
    { v: `${regs.toLocaleString("en-IN")}+`, l: "seats booked" },
    { v: `${all.length}`, l: "sessions this season" },
    { v: `${speakers.length}`, l: "expert hosts" },
    { v: `${free}%`, l: "free to attend" },
  ];
  return (
    <section className="bg-white">
      <div className="container-x">
        <Stagger className="grid grid-cols-2 gap-y-10 border-b border-line pb-16 pt-6 sm:pb-20 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StaggerItem key={s.l} className={cn("px-2 text-center lg:px-6", i > 0 && "lg:border-l lg:border-line")}>
              <CountUp value={s.v} className="block text-4xl font-semibold tracking-tight text-ink sm:text-5xl" />
              <span className="mt-2 block text-sm text-ink-3">{s.l}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ── Explorer (tabs, search, filters) ───────────────────────────────────────
function Explorer({ now }: { now: number }) {
  const regs = useMyRegistrations();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const all = listWebinars();

  const tab = (TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "upcoming") as TabId;
  const topic = TOPICS.some((t) => t.id === params.get("topic")) ? (params.get("topic") as string) : "all";
  const price = PRICES.some((p) => p.id === params.get("price")) ? (params.get("price") as string) : "any";
  const [q, setQ] = useState(params.get("q") ?? "");

  const setParam = (key: string, value: string, def: string) => {
    const nextParams = new URLSearchParams(params.toString());
    if (value === def || !value) nextParams.delete(key);
    else nextParams.set(key, value);
    router.replace(`${pathname}${nextParams.toString() ? `?${nextParams}` : ""}`, { scroll: false });
  };
  // debounce search into the URL
  useEffect(() => {
    const id = setTimeout(() => setParam("q", q.trim(), ""), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const clear = () => {
    setQ("");
    router.replace(pathname + (tab !== "upcoming" ? `?tab=${tab}` : ""), { scroll: false });
  };

  const needle = (params.get("q") ?? "").toLowerCase();
  const results = useMemo(() => {
    if (!now) return [];
    const rank = (w: Webinar) => {
      const st = webinarStatus(w, now);
      return st === "live" ? 0 : st === "cancelled" ? 3 : st === "ended" ? 2 : 1;
    };
    return all
      .filter((w) => {
        const st = webinarStatus(w, now);
        if (tab === "upcoming" && (st === "ended" || st === "cancelled")) return false;
        if (tab === "past" && st !== "ended") return false;
        if (topic !== "all" && w.topic !== topic) return false;
        if (price === "free" && w.price > 0) return false;
        if (price === "paid" && w.price === 0) return false;
        if (needle && !`${w.title} ${w.subtitle} ${w.tags.join(" ")}`.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => (tab === "past" ? endOf(b) - endOf(a) : rank(a) - rank(b) || (rank(a) === 2 ? endOf(b) - endOf(a) : startOf(a) - startOf(b))));
  }, [all, now, tab, topic, price, needle]);

  const filtersOn = topic !== "all" || price !== "any" || !!needle;

  return (
    <Section id="list">
      <SectionHeader
        eyebrow={<Eyebrow>Schedule</Eyebrow>}
        title="Pick your next session"
        subtitle="All times in IST. Every session is recorded for registrants."
        action={<Tabs tabs={TABS} value={tab} onChange={(id) => setParam("tab", id, "upcoming")} />}
      />

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {TOPICS.map((t) => (
            <Chip key={t.id} active={topic === t.id} onClick={() => setParam("topic", t.id, "all")}>
              {t.label}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" aria-hidden />
          {PRICES.map((p) => (
            <Chip key={p.id} active={price === p.id} onClick={() => setParam("price", p.id, "any")}>
              {p.label}
            </Chip>
          ))}
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search webinars</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Flutter, AI, interviews…"
            className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-10 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-3 hover:bg-surface">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {!now ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-3xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Video className="h-5 w-5" />}
          title={filtersOn ? "Nothing matches those filters" : tab === "past" ? "No past sessions yet" : "No upcoming sessions right now"}
          text={filtersOn ? "Try another topic or clear your search." : "Tell us what you'd like to learn and we'll let you know."}
          action={filtersOn ? <Button variant="outline" onClick={clear}>Clear filters</Button> : <Button onClick={() => openContactPopup("Webinar")}>Get notified</Button>}
        />
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((w, i) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <WebinarCard w={w} now={now} reg={regs.find((r) => r.webinarId === w.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </Section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
        active ? "border-brand-600 bg-brand-600 text-white shadow-[var(--shadow-glow)]" : "border-line bg-white text-ink-2 hover:border-brand-200 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// ── How it works (scroll-filled timeline) ─────────────────────────────────
const FLOW = [
  { icon: MousePointerClick, title: "Register", text: "30 seconds. Free for most sessions." },
  { icon: BellRing, title: "Get reminded", text: "Link on WhatsApp + email." },
  { icon: Video, title: "Join live", text: "Room opens 15 min early." },
  { icon: PlayCircle, title: "Rewatch", text: "Recording within 24 hours." },
  { icon: Award, title: "Get certified", text: "Attend live, download PDF." },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section tone="surface">
      <SectionHeader eyebrow={<Eyebrow>How it works</Eyebrow>} title="From sign-up to certificate" align="center" />
      <div ref={ref} className="relative">
        {/* desktop line */}
        <div className="absolute left-[10%] right-[10%] top-7 hidden h-0.5 bg-line lg:block" aria-hidden>
          <motion.div className="h-full bg-brand-gradient" style={{ width }} />
        </div>
        {/* mobile line */}
        <div className="absolute bottom-6 left-7 top-6 w-0.5 bg-line lg:hidden" aria-hidden>
          <motion.div className="w-full bg-brand-gradient" style={{ height }} />
        </div>
        <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-4">
          {FLOW.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 0.08} className="group flex gap-5 lg:flex-col lg:items-center lg:text-center">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-brand-600 shadow-[var(--shadow-soft)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-[var(--shadow-glow)]">
                <f.icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">{i + 1}</span>
              </span>
              <div className="pt-1 lg:pt-3">
                <p className="text-lg font-semibold text-ink">{f.title}</p>
                <p className="mt-1 text-sm text-ink-3">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}

// ── Why attend (interactive bento) ────────────────────────────────────────
function WhyAttend() {
  return (
    <Section>
      <SectionHeader eyebrow={<Eyebrow>Why attend</Eyebrow>} title="More than a video call" subtitle="Every session is built to leave you with something real." />
      <Stagger className="grid gap-5 md:grid-cols-6">
        <StaggerItem className="md:col-span-4">
          <Tile title="Ask anything, live" text="Mentors answer your questions on screen." icon={MessageSquareText}>
            <ChatMock />
          </Tile>
        </StaggerItem>
        <StaggerItem className="md:col-span-2">
          <Tile title="Recorded for you" text="Rewatch with chapters." icon={PlayCircle} dark>
            <PlayerMock />
          </Tile>
        </StaggerItem>
        <StaggerItem className="md:col-span-3">
          <Tile title="Verified certificate" text="Shareable PDF with a public ID." icon={Award}>
            <CertMock />
          </Tile>
        </StaggerItem>
        <StaggerItem className="md:col-span-3">
          <Tile title="Course perks" text="Attendees get course discounts." icon={TicketPercent}>
            <TicketMock />
          </Tile>
        </StaggerItem>
      </Stagger>
    </Section>
  );
}

function Tile({ title, text, icon: Icon, children, dark }: { title: string; text: string; icon: typeof Award; children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        dark ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-brand-200",
      )}
    >
      <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", dark ? "bg-white/10 text-white" : "bg-brand-50 text-brand-600")}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-5 text-xl font-semibold tracking-tight">{title}</p>
      <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-ink-3")}>{text}</p>
      <div className="mt-6 flex flex-1 items-end">{children}</div>
    </div>
  );
}

function ChatMock() {
  const msgs = [
    { who: "Aman", text: "How do I handle Firebase auth errors?", me: false },
    { who: "Mentor", text: "Wrap the call in try/catch and map the error codes — showing it now.", me: true },
    { who: "Sneha", text: "Will the code be shared?", me: false },
  ];
  return (
    <div className="w-full space-y-2.5">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.35 }}
          className={cn("flex", m.me && "justify-end")}
        >
          <span className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm transition-transform duration-300 group-hover:translate-x-0", m.me ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-surface text-ink-2")}>
            <span className={cn("mb-0.5 block text-[11px] font-semibold", m.me ? "text-white/70" : "text-ink-3")}>{m.who}</span>
            {m.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function PlayerMock() {
  return (
    <div className="w-full">
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:scale-110">
          <PlayCircle className="h-6 w-6" />
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-brand-400" initial={{ width: "8%" }} whileInView={{ width: "64%" }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeOut" }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/50">
        <span>Riverpod</span>
        <span>37:25</span>
      </div>
    </div>
  );
}

function CertMock() {
  return (
    <div className="w-full rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)] transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]">
      <div className="h-1.5 w-20 rounded-full bg-brand-gradient" />
      <p className="mt-3 font-serif text-lg italic text-brand-700">Your Name</p>
      <p className="text-xs text-ink-3">Certificate of Participation</p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-3">
        <span className="font-mono">VDL-WB-FLUTT-7Q4K2M</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">Verified</span>
      </div>
    </div>
  );
}

function TicketMock() {
  return (
    <div className="relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white transition-transform duration-300 group-hover:scale-[1.02]">
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" aria-hidden />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" aria-hidden />
      <div className="pl-3">
        <p className="text-xs text-white/70">Attendee code</p>
        <p className="font-mono text-lg font-semibold tracking-wider">WEBINAR1000</p>
      </div>
      <p className="pr-3 text-right text-2xl font-semibold">
        ₹1,000<span className="block text-xs font-normal text-white/70">off the course</span>
      </p>
    </div>
  );
}

// ── Speakers ─────────────────────────────────────────────────────────────
function Speakers() {
  const all = listWebinars();
  return (
    <Section tone="surface">
      <SectionHeader eyebrow={<Eyebrow>Your hosts</Eyebrow>} title="Learn from people who build" />
      <Stagger className="grid gap-6 md:grid-cols-3">
        {speakers.map((s) => {
          const count = all.filter((w) => w.speakerIds.includes(s.id)).length;
          return (
            <StaggerItem key={s.id}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <div className="relative mx-auto w-fit">
                  <span className="absolute -inset-1.5 rounded-full bg-brand-gradient opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40" aria-hidden />
                  <span className="relative block transition-transform duration-500 group-hover:scale-105">
                    <Avatar name={s.name} photo={s.photo} size={112} ring />
                  </span>
                </div>
                <p className="relative mt-5 text-xl font-semibold text-ink">{s.name}</p>
                <p className="relative text-sm text-brand-700">{s.role}</p>
                <p className="relative mx-auto mt-3 max-w-xs text-sm text-ink-3">{s.bio}</p>
                <span className="relative mt-5 inline-flex rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-2">{count} sessions this season</span>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────
function Faq() {
  const items = [
    { q: "Are the webinars really free?", a: "Most are. Paid sessions show the price on the card and you only pay when you book." },
    { q: "How do I join?", a: "Use the Join button on the webinar page or in My Webinars. The room opens 15 minutes before the start, and the link also comes on WhatsApp and email." },
    { q: "What if I miss it?", a: "Registered attendees get the recording within 24 hours. It stays online for the period shown on each webinar." },
    { q: "How do I get the certificate?", a: "Attend the minimum live time shown on the webinar (and pass the short quiz if there is one). Download it from Webinar Certificates in your dashboard." },
    { q: "Can I ask questions during the session?", a: "Yes — use the chat or raise your hand. Mentors answer questions live." },
  ];
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeader eyebrow={<Eyebrow>FAQ</Eyebrow>} title="Questions, answered" className="mb-8" />
          <div className="rounded-3xl bg-surface p-7">
            <p className="text-lg font-semibold text-ink">Still unsure?</p>
            <p className="mt-1 text-sm text-ink-3">A mentor will call you back — usually the same day.</p>
            <Button className="mt-5" variant="dark" onClick={() => openContactPopup("Webinar")}>
              Contact us <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Reveal>
          <Accordion items={items} />
        </Reveal>
      </div>
    </Section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────
function FinalCta({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="bg-white pb-24">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-8 py-16 text-white sm:px-14 sm:py-20">
          <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <motion.div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <Sparkles className="h-6 w-6 text-white/80" />
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Your next skill is one session away.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="white" onClick={onRegister}>
                <CalendarCheck className="h-4 w-4" /> Register now
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10" href="/view-courses">
                Browse courses
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Floating mobile CTA ──────────────────────────────────────────────────
function MobileCta({ next, onRegister }: { next: Webinar | null; onRegister: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 900;
      setShow(window.scrollY > 700 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!next) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-3 left-3 right-20 z-40 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/90 p-3 pl-4 shadow-[var(--shadow-lift)] backdrop-blur-xl md:hidden"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{next.title}</p>
            <p className="text-xs text-ink-3">
              {fmtDate(next.sessions[0].startsAt)} · {inr(next.price)}
            </p>
          </div>
          <Button size="sm" onClick={onRegister}>
            Register
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
