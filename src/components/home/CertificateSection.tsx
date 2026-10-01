"use client";

import Image from "next/image";
import { useRef } from "react";
import { useReducedMotion, useScroll, useSpring } from "framer-motion";
import { BadgeCheck, BookOpen, Download, Hammer, Linkedin, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal, Section, SectionHeader, motion } from "@/ui";

const highlights = [
  { icon: ShieldCheck, text: "Earned through assessments and projects" },
  { icon: Sparkles, text: "In-demand Flutter skills" },
  { icon: Linkedin, text: "Ready for LinkedIn and resumes" },
  { icon: Download, text: "High-resolution A4 PDF" },
];

const steps = [
  { icon: BookOpen, title: "Complete the modules", text: "Flutter, Dart, UI and APIs." },
  { icon: Hammer, title: "Build your projects", text: "Ship real apps, pass assessments." },
  { icon: BadgeCheck, title: "Get your certificate", text: "Download and share once reviewed." },
];

export default function CertificateSection() {
  const stepsRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <Section tone="dark" className="overflow-hidden">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" aria-hidden />

      <div className="relative">
        <SectionHeader
          dark
          align="center"
          eyebrow={
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-300" aria-hidden />
              Certification
            </span>
          }
          title="Earn a certificate that proves it"
          subtitle="Finish the course and assessments to show what you can build."
        />

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          {/* Certificate */}
          <Reveal>
            <motion.div
              initial={{ rotate: -3 }}
              whileHover={reduce ? undefined : { rotate: 0, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="rounded-2xl bg-white p-2.5 shadow-[0_40px_80px_-30px_rgb(16_26_201/0.6)] ring-1 ring-white/10 sm:p-3"
            >
              <Image
                src="/images/certificate002.png"
                alt="Sample Vereda course certificate"
                width={1400}
                height={1000}
                className="h-auto w-full rounded-xl object-contain"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </motion.div>
          </Reveal>

          {/* Highlights */}
          <Reveal delay={0.1}>
            <ul className="grid gap-3">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] text-white/85">{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/50">Signed by Himanshu Kumar, CEO and Founder.</p>
          </Reveal>
        </div>

        {/* How you earn it */}
        <div className="mt-20 sm:mt-24">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-wider text-white/50">How you earn it</p>
          <ol ref={stepsRef} className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
            {/* Progress line (desktop: horizontal, mobile: vertical) */}
            <div className="absolute left-[22px] top-0 h-full w-px bg-white/10 sm:left-[16.66%] sm:right-[16.66%] sm:top-[22px] sm:h-px sm:w-auto" aria-hidden>
              <motion.div
                style={{ scaleX: progress }}
                className="hidden h-full w-full origin-left bg-brand-gradient sm:block"
              />
              <motion.div
                style={{ scaleY: progress }}
                className="h-full w-full origin-top bg-brand-gradient sm:hidden"
              />
            </div>

            {steps.map(({ icon: Icon, title, text }, idx) => (
              <li key={title} className="relative flex gap-5 sm:flex-col sm:items-center sm:text-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: idx * 0.15 }}
                  className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white ring-1 ring-white/20"
                >
                  <span className="absolute inset-0 rounded-full bg-brand-gradient opacity-90" aria-hidden />
                  <Icon className="relative h-5 w-5" aria-hidden="true" />
                </motion.span>
                <div className="sm:mt-5">
                  <p className="text-xs font-semibold text-white/40">Step {idx + 1}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
