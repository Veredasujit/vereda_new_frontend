"use client";

import Image from "next/image";
import { ArrowRight, Award, GraduationCap, Laptop } from "lucide-react";
import { Button, Eyebrow, IconTile, Parallax, Reveal, Section, SectionHeader, Stagger, StaggerItem } from "@/ui";

const features = [
  {
    icon: GraduationCap,
    title: "Skilled instructors",
    text: "Working developers using current tools.",
  },
  {
    icon: Award,
    title: "Certificate and career support",
    text: "Resume, interviews and placement help.",
  },
  {
    icon: Laptop,
    title: "Flexible online learning",
    text: "Study at your own pace, fully online.",
  },
];

export default function AboutVereda() {
  return (
    <Section tone="surface">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <Reveal className="order-last lg:order-first">
          <Parallax offset={20}>
            <div className="overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-[var(--shadow-lift)]">
              <Image
                src="/images/home1.webp"
                alt="Learners at Vereda"
                height={600}
                width={800}
                className="h-auto w-full rounded-[1.25rem]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Parallax>
        </Reveal>

        {/* Content */}
        <div>
          <SectionHeader
            className="mb-10 sm:mb-10"
            eyebrow={<Eyebrow>About Vereda</Eyebrow>}
            title="Skills and outcomes over degrees"
            subtitle="Vereda Digital Technologies runs focused bootcamps built around real skills."
          />

          <Stagger className="space-y-3">
            {features.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-soft)]">
                  <IconTile className="shrink-0">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </IconTile>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{title}</h3>
                    <p className="mt-0.5 text-sm text-ink-3">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Button href="/login" variant="dark" size="lg" className="mt-10">
            Start learning today
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Section>
  );
}
