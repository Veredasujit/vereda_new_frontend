"use client";

import Image from "next/image";
import { Badge, Eyebrow, Section, SectionHeader, Stagger, StaggerItem } from "@/ui";

const teamMembers = [
  {
    name: "Himanshu Kumar",
    role: "Founder",
    qualification: "9+ years experience",
    image: "/images/Pictures-2.png",
    description: "Leads Vereda with one goal: practical tech education that leads to real careers.",
  },
  {
    name: "Hermant Kumar",
    role: "Co-Founder",
    qualification: "9+ years experience",
    image: "/images/Hermant-kumar.webp",
    description: "Scales operations and delivery so every learner gets consistent support.",
  },
];

export default function Management() {
  return (
    <Section>
      <SectionHeader
        align="center"
        eyebrow={<Eyebrow>Leadership</Eyebrow>}
        title="Meet the founders"
        subtitle="The people building Vereda Digital Learning."
      />

      <Stagger className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {teamMembers.map((member) => (
          <StaggerItem key={member.name}>
            <article className="group h-full overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <div className="relative flex justify-center overflow-hidden bg-mesh pb-2 pt-10">
                <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative h-40 w-40 overflow-hidden rounded-full ring-8 ring-white shadow-[var(--shadow-lift)] transition-transform duration-500 group-hover:scale-105">
                  <Image src={member.image} alt={member.name} fill sizes="160px" className="object-cover" />
                </div>
              </div>
              <div className="p-6 text-center sm:p-7">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-xl font-semibold tracking-tight text-ink">{member.name}</h3>
                  <Badge>{member.role}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-3">{member.qualification}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{member.description}</p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
