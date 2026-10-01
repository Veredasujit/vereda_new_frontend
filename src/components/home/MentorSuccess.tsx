"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, CountUp, Eyebrow, Reveal, Section, SectionHeader, Skeleton, Stagger, StaggerItem, cn } from "@/ui";

const stats = [
  { number: "7+", label: "Years training developers" },
  { number: "5,000+", label: "Learners enrolled" },
  { number: "2,000+", label: "Students placed" },
  { number: "50+", label: "Projects built" },
];

export default function MentorSuccess() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Section>
      {/* Mentor associates */}
      <SectionHeader
        align="center"
        eyebrow={<Eyebrow>Mentor community</Eyebrow>}
        title={<span id="mentor-success-heading">Learn from industry mentors</span>}
        subtitle="Our mentors work at leading companies across the industry."
      />

      <Reveal className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
          {isLoading && <Skeleton className="absolute inset-0" />}
          <Image
            src="/images/mentor-community-companies.png"
            alt="Companies our mentors work with, including Dainik Bhaskar"
            width={800}
            height={400}
            className={cn("relative mx-auto h-auto w-full object-contain transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </Reveal>

      {/* CTA and stats */}
      <div className="relative mt-20 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:mt-28 sm:p-12">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <Reveal className="text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.05]">Reach your career goals</h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/70 lg:mx-0">
              One-to-one guidance from industry professionals.
            </p>
            <Button href="/contact" variant="white" size="lg" className="mt-8">
              Request a call back
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="flex h-full flex-col-reverse rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-white/50">{stat.label}</p>
                  <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    <CountUp value={stat.number} />
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}
