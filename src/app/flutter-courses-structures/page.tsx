"use client";

import { useRef, useState } from "react";
import { useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Download,
  FileText,
  Globe,
  Layers,
  PlayCircle,
  Plus,
  RefreshCw,
  BarChart3,
  Video,
} from "lucide-react";
import { AnimatePresence, Badge, Button, Card, CountUp, Eyebrow, Reveal, Stagger, StaggerItem, cn, motion } from "@/ui";

interface Lecture {
  title: string;
  duration: string;
  isPreview?: boolean;
}

interface Section {
  title: string;
  lectures: Lecture[];
  totalLectures: number;
  totalDuration: string;
  progress?: number;
}

const courseIncludes = [
  { icon: Video, text: "30 hours on-demand video" },
  { icon: FileText, text: "Assignments" },
  { icon: Download, text: "43 downloadable resources" },
  { icon: CheckCircle, text: "Certificate of completion" },
  { icon: FileText, text: "23 articles" },
];

const sections: Section[] = [
  {
    title: "Introduction",
    totalLectures: 13,
    totalDuration: "1hr 7min",
    progress: 0,
    lectures: [
      { title: "Welcome to the course", duration: "4m", isPreview: false },
      { title: "Setting up environment", duration: "10m", isPreview: false },
      { title: "Your first Flutter app", duration: "15m" },
    ],
  },
  {
    title: "Flutter & Dart Basics I - Getting a Solid Foundation [Roll Dice App]",
    totalLectures: 39,
    totalDuration: "3hr 27min",
    progress: 0,
    lectures: [
      { title: "Understanding Widgets", duration: "10m" },
      { title: "Building the UI", duration: "20m", isPreview: false },
    ],
  },
  {
    title: "Flutter & Dart Basics II - Getting a Solid Foundation [Roll Dice App]",
    totalLectures: 39,
    totalDuration: "3hr 27min",
    progress: 0,
    lectures: [
      { title: "Understanding Widgets", duration: "10m" },
      { title: "Building the UI", duration: "20m", isPreview: false },
    ],
  },
  {
    title: "Debugging Flutter Apps",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Adding Interactivity, More Widgets & Theming",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Building Responsive & Adaptive User Interfaces",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Flutter & Dart Internals",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Building Multi-Screen Apps & Navigating Between Screens",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Managing App-wide State",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Adding Animations",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Handling User Input & Working with Forms",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Connecting a Backend & Sending HTTP Requests",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Using Native Device Features",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Push Notifications & More: Building a Chat App with Flutter & Firebase",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  },
  {
    title: "Next Steps & Roundup",
    totalLectures: 6,
    totalDuration: "33min",
    progress: 0,
    lectures: [
      { title: "Common Debugging Tools", duration: "10m" },
      { title: "Using DevTools", duration: "23m" },
    ],
  }
];

function TimelineNode({ section, index, open, onToggle }: { section: Section; index: number; open: boolean; onToggle: () => void }) {
  const panelId = `section-panel-${index}`;
  const done = section.progress === 100;
  const hasProgress = section.progress !== undefined && section.progress > 0;
  return (
    <li className="relative pb-4 pl-14 sm:pl-16">
      {/* Node */}
      <span
        className={cn(
          "absolute left-0 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-300 sm:left-1",
          open ? "border-brand-600 bg-brand-600 text-white shadow-[var(--shadow-glow)]" : "border-line bg-white text-ink-2",
        )}
        aria-hidden
      >
        {done ? <CheckCircle className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
      </span>

      <Reveal y={14}>
        <div
          className={cn(
            "rounded-2xl border bg-white transition-all duration-300",
            open ? "border-brand-200 shadow-[var(--shadow-lift)]" : "border-line shadow-[var(--shadow-soft)] hover:border-brand-200",
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand-700">Section {index + 1}</span>
              <span className="mt-1 block text-base font-semibold text-ink sm:text-lg">{section.title}</span>
              <span className="mt-1 block text-sm text-ink-3">
                {section.totalLectures} lectures · {section.totalDuration}
                {hasProgress && ` · ${section.progress}% complete`}
              </span>
            </span>
            <span
              className={cn(
                "mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                open ? "rotate-45 border-brand-600 bg-brand-600 text-white" : "border-line text-ink-2",
              )}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="mx-5 mb-5 divide-y divide-line rounded-xl bg-surface sm:mx-6">
                  {section.lectures.map((lec, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2.5 text-ink-2">
                        <PlayCircle className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                        <span className="truncate">{lec.title}</span>
                        {lec.isPreview && <Badge tone="brand">Preview</Badge>}
                      </span>
                      <span className="shrink-0 tabular-nums text-ink-3">{lec.duration}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </li>
  );
}

export default function FlutterCourseDetail() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const totalLectures = sections.reduce((sum, s) => sum + s.totalLectures, 0);
  const totalDuration = "30h";

  const timelineRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const stats = [
    { value: String(sections.length), label: "Sections" },
    { value: String(totalLectures), label: "Lectures" },
    { value: totalDuration, label: "Video" },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      {/* Hero */}
      <header className="relative overflow-hidden bg-mesh">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-x relative pb-14 pt-16 sm:pb-20 sm:pt-24">
          <Reveal>
            <Eyebrow>Development · Flutter</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.02]">
              Flutter &amp; Dart: <span className="text-gradient-brand">The Complete Guide</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-3">
              Build native iOS and Android apps through hands-on projects.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-ink-3">{s.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </header>

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          {/* Timeline */}
          <div className="min-w-0 lg:col-span-2">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Course content</h2>
              <p className="text-sm text-ink-3">
                {sections.length} sections · {totalLectures} lectures · {totalDuration}
              </p>
            </div>

            <ol ref={timelineRef} className="relative" aria-label="Course sections">
              {/* Track + scroll fill */}
              <span className="absolute bottom-6 left-5 top-3 w-px bg-line sm:left-6" aria-hidden />
              <motion.span
                className="absolute bottom-6 left-5 top-3 w-px origin-top bg-brand-gradient sm:left-6"
                style={{ scaleY: reduce ? 1 : fill }}
                aria-hidden
              />
              {sections.map((section, idx) => (
                <TimelineNode
                  key={section.title}
                  section={section}
                  index={idx}
                  open={openSection === idx}
                  onToggle={() => setOpenSection(openSection === idx ? null : idx)}
                />
              ))}
            </ol>
          </div>

          {/* Sticky side card */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <Reveal delay={0.1}>
                <Card className="overflow-hidden rounded-3xl">
                  <div className="relative flex aspect-video items-center justify-center bg-ink">
                    <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
                    <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
                      <BookOpen className="h-6 w-6" aria-hidden />
                    </span>
                  </div>
                  <div className="p-6">
                    <Button href="/view-courses" size="lg" className="w-full">
                      Enroll now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                    <p className="mb-3 mt-6 text-sm font-semibold text-ink">What&apos;s included</p>
                    <ul className="space-y-3">
                      {courseIncludes.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-sm text-ink-2">
                          <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <dl className="space-y-3 border-t border-line p-6 text-sm">
                    {[
                      { icon: BarChart3, k: "Level", v: "Beginner to Advanced" },
                      { icon: RefreshCw, k: "Last updated", v: "December 2024" },
                      { icon: Globe, k: "Language", v: "English" },
                    ].map(({ icon: Icon, k, v }) => (
                      <div key={k} className="flex items-center justify-between gap-4">
                        <dt className="inline-flex items-center gap-2 text-ink-3">
                          <Icon className="h-4 w-4" aria-hidden />
                          {k}
                        </dt>
                        <dd className="font-medium text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </Reveal>
            </div>
          </aside>
        </div>
      </section>

      {/* Included (mobile / tablet) */}
      <section className="pb-16 lg:hidden">
        <div className="container-x">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-ink">What&apos;s included</h2>
          <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {courseIncludes.map(({ icon: Icon, text }) => (
              <StaggerItem key={text}>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm text-ink-2">
                  <Icon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                  {text}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="neutral">
              <Layers className="h-3.5 w-3.5" aria-hidden /> Beginner to Advanced
            </Badge>
            <Badge tone="neutral">
              <Globe className="h-3.5 w-3.5" aria-hidden /> English
            </Badge>
            <Badge tone="neutral">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Updated December 2024
            </Badge>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 backdrop-blur lg:hidden">
        <div className="container-x flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Flutter &amp; Dart</p>
            <p className="text-xs text-ink-3">
              {totalLectures} lectures · {totalDuration}
            </p>
          </div>
          <Button href="/view-courses" className="shrink-0">
            Enroll now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
