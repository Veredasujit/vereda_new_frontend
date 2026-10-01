"use client";

// Home page strip: the next three live/upcoming webinars.

import { ArrowRight } from "lucide-react";
import { listWebinars } from "@/webinars/lib/api";
import { useMyRegistrations, useNow } from "@/webinars/lib/hooks";
import { startOf, webinarStatus } from "@/webinars/lib/utils";
import WebinarCard from "@/webinars/components/WebinarCard";
import { Button, Eyebrow, Section, SectionHeader, Stagger, StaggerItem } from "@/ui";

export default function UpcomingWebinars() {
  const now = useNow(60_000);
  const regs = useMyRegistrations();
  if (!now) return null;

  const next = listWebinars()
    .filter((w) => {
      const st = webinarStatus(w, now);
      return st !== "ended" && st !== "cancelled";
    })
    .sort((a, b) => (webinarStatus(a, now) === "live" ? -1 : webinarStatus(b, now) === "live" ? 1 : startOf(a) - startOf(b)))
    .slice(0, 3);

  if (next.length === 0) return null;

  return (
    <Section tone="surface">
      <SectionHeader
        eyebrow={<Eyebrow>Free live webinars</Eyebrow>}
        title="Try a live session first"
        subtitle="Meet the mentors before you pick a course."
        action={
          <Button href="/webinars" variant="outline">
            All webinars <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        }
      />
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {next.map((w) => (
          <StaggerItem key={w.id} className="h-full">
            <WebinarCard w={w} now={now} reg={regs.find((r) => r.webinarId === w.id)} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
