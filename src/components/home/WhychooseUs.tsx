"use client";

import {
  BrainCircuit,
  ClipboardCheck,
  Layers,
  Radio,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Eyebrow, IconTile, Section, SectionHeader, Stagger, StaggerItem, cn } from "@/ui";

type Item = { icon: LucideIcon; title: string; text: string; large?: boolean };

const items: Item[] = [
  {
    icon: Radio,
    title: "Live, interactive Flutter classes",
    text: "Learn in real time and ask questions as you build.",
    large: true,
  },
  {
    icon: BrainCircuit,
    title: "AI-assisted learning",
    text: "Use AI tools hands-on, the way teams work today.",
    large: true,
  },
  { icon: UserRound, title: "One-to-one mentorship", text: "A mentor who knows your work." },
  { icon: Layers, title: "Industry-level projects", text: "Flutter and AI apps for your portfolio." },
  { icon: Target, title: "Placement-focused", text: "Training and support for hiring." },
  { icon: ClipboardCheck, title: "Weekly assessments", text: "Tests and quizzes track progress." },
];

export default function WhychooseUs() {
  return (
    <Section>
      <SectionHeader
        align="center"
        eyebrow={<Eyebrow>Why Vereda</Eyebrow>}
        title="Built to get you hired"
        subtitle="Mentorship, placement support and a community that stays with you."
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {items.map(({ icon: Icon, title, text, large }) => (
          <StaggerItem key={title} className={cn(large && "sm:col-span-2 lg:row-span-1")}>
            <div
              className={cn(
                "group relative h-full overflow-hidden rounded-3xl border border-line transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]",
                large ? "bg-mesh min-h-[220px] p-6 sm:p-9" : "bg-white p-6 sm:p-7",
              )}
            >
              {large && <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />}
              <div className="relative flex h-full flex-col">
                <IconTile className={"transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white"}>
                  <Icon className={large ? "h-6 w-6" : "h-5 w-5"} aria-hidden="true" />
                </IconTile>
                <div className="mt-auto pt-8">
                  <h3 className={cn("font-semibold tracking-tight text-ink", large ? "text-2xl" : "text-lg")}>{title}</h3>
                  <p className={cn("mt-1.5 text-ink-3", large ? "max-w-sm text-base" : "text-sm")}>{text}</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
