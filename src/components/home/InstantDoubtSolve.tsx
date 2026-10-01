"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Infinity as InfinityIcon,
  MessageCircleQuestion,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, Eyebrow, IconTile, Reveal, Section, SectionHeader, cn, motion } from "@/ui";

type Feature = { icon: LucideIcon; title: string; text: string; metric: string; metricLabel: string };

const features: Feature[] = [
  {
    icon: MessageCircleQuestion,
    title: "Doubts answered fast",
    text: "Mentors reply with a clear answer whenever you get stuck.",
    metric: "5–10 min",
    metricLabel: "Typical reply time",
  },
  {
    icon: UserRound,
    title: "One-to-one mentorship",
    text: "A mentor reviews your work and keeps you on track.",
    metric: "1:1",
    metricLabel: "Personal feedback",
  },
  {
    icon: BadgeCheck,
    title: "Weekly assessments",
    text: "Regular tests help you revise and measure progress.",
    metric: "Weekly",
    metricLabel: "Tests and quizzes",
  },
  {
    icon: BriefcaseBusiness,
    title: "Placement preparation",
    text: "Resume support and mock interviews before real hiring.",
    metric: "Mock",
    metricLabel: "Interviews and resume review",
  },
];

export default function InstantDoubtSolve() {
  const [active, setActive] = useState(0);
  const current = features[active];
  const CurrentIcon = current.icon;

  return (
    <Section tone="surface">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Feature list */}
        <div>
          <SectionHeader
            className="mb-10 sm:mb-10"
            eyebrow={<Eyebrow>Mentor support</Eyebrow>}
            title="Never learn alone"
            subtitle="From your first lesson to your first job."
          />

          <ul className="space-y-2" role="list">
            {features.map(({ icon: Icon, title, text }, i) => {
              const isActive = i === active;
              return (
                <li key={title}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={cn(
                      "relative flex w-full items-start gap-4 rounded-2xl px-4 py-4 text-left transition-colors sm:px-5",
                      isActive ? "text-ink" : "text-ink-2 hover:bg-white/60",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="doubt-active"
                        className="absolute inset-0 rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors",
                        isActive ? "bg-brand-600 text-white ring-brand-600" : "bg-brand-50 text-brand-600 ring-brand-100",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="relative">
                      <span className="block text-base font-semibold sm:text-lg">{title}</span>
                      <span
                        className={cn(
                          "block overflow-hidden text-sm text-ink-3 transition-all duration-300",
                          isActive ? "mt-1 max-h-20 opacity-100" : "max-h-0 opacity-0",
                        )}
                      >
                        {text}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Visual */}
        <Reveal className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
            <div className="bg-mesh pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex justify-center">
              <Image
                src="/images/imgsvg.webp"
                alt="Mentor helping a student"
                width={450}
                height={450}
                className="h-auto w-[85%] object-contain sm:w-[380px]"
              />
            </div>

            <div className="relative mt-6 min-h-[92px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-white/90 p-4 backdrop-blur"
                  aria-live="polite"
                >
                  <IconTile className="shrink-0">
                    <CurrentIcon className="h-5 w-5" aria-hidden="true" />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-semibold tracking-tight text-ink">{current.metric}</p>
                    <p className="text-sm text-ink-3">{current.metricLabel}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute -top-4 right-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-lift)]">
            <InfinityIcon className="h-4 w-4" aria-hidden="true" />
            Lifetime access to recordings
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
