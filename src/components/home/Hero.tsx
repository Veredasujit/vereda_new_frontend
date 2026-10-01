'use client';
import { openContactPopup } from "@/contact-popup/ContactPopup";

import Image from 'next/image';
import { ArrowRight, Phone, Radio, Users } from 'lucide-react';
import { Button, Eyebrow, Parallax, motion } from '@/ui';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="container-x relative grid items-center gap-14 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Copy */}
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <Eyebrow>Flutter + AI program · New batch open</Eyebrow>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-7xl">
            Become an app developer in <span className="text-gradient-brand">12 weeks</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-3 sm:text-xl lg:mx-0">
            Flutter, Firebase and AI through real projects and mentorship, even as a beginner.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button href="/view-courses" size="lg">
              Explore the program
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => openContactPopup("Free counselling")}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Request a call back
            </Button>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          className="relative mx-auto w-full max-w-md lg:max-w-none"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <div className="pointer-events-none absolute -inset-6 -z-0 rounded-[2.5rem] bg-brand-gradient opacity-10 blur-3xl" aria-hidden />
          <Parallax offset={24} className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white p-2 shadow-[var(--shadow-lift)]">
              <Image
                src="/images/hero4.jpeg"
                alt="Student learning app development online"
                width={500}
                height={600}
                className="h-auto w-full rounded-[1.25rem] object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              />
            </div>
          </Parallax>

          {/* Floating chips */}
          <div className="absolute -left-3 top-8 animate-float-slow sm:-left-8">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 px-3.5 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur-md">
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Radio className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs text-ink-3">Every week</span>
                <span className="block text-sm font-semibold text-ink">Live classes</span>
              </span>
            </div>
          </div>
          <div className="absolute -right-3 bottom-10 animate-float-slow [animation-delay:-4.5s] sm:-right-8">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 px-3.5 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Users className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs text-ink-3">Learners enrolled</span>
                <span className="block text-sm font-semibold text-ink">5,000+</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
