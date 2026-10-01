"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ArrowRight, Award, HeartHandshake, Sparkles, Target, Users } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CountUp,
  Eyebrow,
  PageHeader,
  Parallax,
  Reveal,
  Section,
  SectionHeader,
  Spinner,
  Stagger,
  StaggerItem,
  cn,
} from "@/ui";

const teamMembers = [
  {
    name: "Himanshu Kumar",
    role: "Founder",
    qualification: "9+ years experience",
    image: "/images/Pictures-2.png",
    description:
      "Himanshu leads product, training and curriculum, with a focus on mobile development, UI/UX and system architecture.",
  },
  {
    name: "Hermant Kumar",
    role: "Co-Founder",
    qualification: "9+ years experience",
    image: "/images/Hermant-kumar.webp",
    description:
      "Hermant runs operations and learner support, and shapes how our programs are delivered and mentored.",
  },
];

const values = [
  {
    title: "Quality",
    description: "Training that follows the workflows real development teams use.",
    icon: Award,
    span: "md:col-span-2",
  },
  {
    title: "Accessibility",
    description: "Flexible, affordable programs for learners from every background.",
    icon: HeartHandshake,
    span: "",
  },
  {
    title: "Impact",
    description: "Real outcomes: a portfolio of apps, confidence and job opportunities.",
    icon: Target,
    span: "",
  },
  {
    title: "Student-centricity",
    description: "Mentorship and support tailored to each learner's goals.",
    icon: Users,
    span: "md:col-span-2",
  },
];

const stats = [
  { value: "7+", label: "Years of training" },
  { value: "5K+", label: "Learners mentored" },
  { value: "9+", label: "Years of founder experience" },
];

const AboutPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero with image collage */}
      <PageHeader
        eyebrow={<Eyebrow>About Vereda</Eyebrow>}
        title={
          <>
            Build your career in <span className="text-gradient-brand">app development and AI</span>
          </>
        }
        subtitle="Hands-on projects, live mentorship and placement support that turn learners into job-ready developers."
      >
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-wrap gap-3">
            <Button href="/view-courses" size="lg">
              Explore courses <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact us
            </Button>
          </div>

          <div className="relative mx-auto h-[340px] w-full max-w-xl sm:h-[420px]">
            <Parallax offset={24} className="absolute left-0 top-0 w-[62%]">
              <figure className="overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-lift)]">
                <Image
                  src="/images/aboutus2.jpeg"
                  alt="Vereda learners in a hands-on session"
                  width={600}
                  height={600}
                  className="h-56 w-full object-cover sm:h-72"
                  priority
                />
              </figure>
            </Parallax>
            <Parallax offset={-30} className="absolute bottom-0 right-0 w-[58%]">
              <figure className="overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[var(--shadow-lift)]">
                <Image
                  src="/images/aboutus3.jpeg"
                  alt="Vereda learning environment"
                  width={600}
                  height={600}
                  className="h-52 w-full object-cover sm:h-64"
                  priority
                />
              </figure>
            </Parallax>
            <div className="absolute bottom-6 left-2 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur sm:left-6">
              <p className="text-xs font-medium text-ink-3">Hands-on learning</p>
              <p className="text-sm font-semibold text-ink">Expert mentorship</p>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Mission */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow>Our mission</Eyebrow>
            <p className="mt-6 text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl">
              Make practical, outcome-focused Flutter education accessible, so every learner goes from{" "}
              <span className="text-ink-3">interested</span> to <span className="text-brand-600">employable</span>.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Parallax offset={20}>
              <div className="overflow-hidden rounded-3xl border border-line shadow-[var(--shadow-soft)]">
                <Image
                  src="/images/aboutus4.jpeg"
                  alt="Team working at Vereda"
                  width={800}
                  height={600}
                  className="h-72 w-full object-cover lg:h-[26rem]"
                />
              </div>
            </Parallax>
          </Reveal>
        </div>
      </Section>

      {/* Values bento */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={<Eyebrow>Our values</Eyebrow>}
          title="The principles behind every program"
          subtitle="Four commitments that shape how we teach."
        />
        <Stagger className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <StaggerItem key={value.title} className={value.span}>
                <Card interactive className="group h-full p-7 sm:p-8">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink-3">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-ink">{value.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-3">{value.description}</p>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {/* Stats band */}
      <section className="border-y border-line bg-white py-14 sm:py-16">
        <div className="container-x">
          <dl className="grid grid-cols-1 gap-y-10 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className={cn("px-4 text-center", i > 0 && "sm:border-l sm:border-line")}>
                <dd className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  <CountUp value={s.value} />
                </dd>
                <dt className="mt-2 text-sm text-ink-3">{s.label}</dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Leadership */}
      <Section>
        <SectionHeader
          align="center"
          eyebrow={<Eyebrow>Leadership</Eyebrow>}
          title="The people shaping how Vereda teaches"
        />
        <Stagger className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {teamMembers.map((member) => (
            <StaggerItem key={member.name}>
              <Card interactive className="group h-full overflow-hidden">
                <div className="relative flex justify-center overflow-hidden bg-mesh pb-2 pt-10">
                  <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
                  <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-[var(--shadow-lift)] ring-8 ring-white transition-transform duration-500 group-hover:scale-105">
                    <Image src={member.image} alt={member.name} fill sizes="160px" className="object-cover" />
                  </div>
                </div>
                <div className="p-7 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge>{member.role}</Badge>
                    <Badge tone="neutral">{member.qualification}</Badge>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{member.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-3">{member.description}</p>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Mentor companies */}
      <Section tone="surface">
        <SectionHeader
          align="center"
          eyebrow={<Eyebrow>Mentor network</Eyebrow>}
          title="Learn from mentors at leading companies"
          subtitle="Real product experience in every live session."
        />
        <Reveal>
          <div className="relative mx-auto w-full max-w-4xl rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white">
                <Spinner className="h-7 w-7" />
              </div>
            )}
            <Image
              src="/images/mentor-community-companies.png"
              alt="Companies our mentors come from"
              width={900}
              height={450}
              className={cn(
                "mx-auto h-auto w-full object-contain transition-opacity duration-500",
                isLoading ? "opacity-0" : "opacity-100",
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
            <p className="mt-6 text-center text-xs text-ink-3">
              Logos are for representation only. Mentors come from a range of product and service companies.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl"
          aria-hidden
        />
        <div className="container-x relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Start today
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.05]">
              Ready to build your first real app?
            </h2>
            <p className="mt-4 text-lg text-white/70">Pick a course and learn with a mentor by your side.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/view-courses" size="lg">
                Explore courses <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
              <Button
                href="/contact"
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
              >
                Contact us
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
