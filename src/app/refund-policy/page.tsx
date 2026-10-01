"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, XCircle } from "lucide-react";
import { Badge, Button, Eyebrow, PageHeader, Reveal, cn } from "@/ui";

const p = "mt-4 text-base leading-7 text-ink-2";
const link = "font-medium text-brand-600 underline decoration-brand-200 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-500";
const h2 = "text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]";
const sectionCls = "scroll-mt-28 border-t border-line pt-10 first:border-t-0 first:pt-0";

const notes = [
  "All purchases are considered final at the moment of transaction completion",
  "Digital products, courses, and services cannot be returned or exchanged",
  "Subscription fees and one-time payments are non-refundable",
  "No exceptions will be made to this policy under any circumstances",
  "Chargebacks or disputes may result in account suspension",
];

const sections = [
  { id: "final", label: "All sales are final" },
  { id: "returns", label: "No returns or exchanges" },
  { id: "clarification", label: "Need clarification?" },
];

/** Tracks which section is currently in view for the table of contents. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const sectionIds = sections.map((s) => s.id);

export default function RefundPolicy() {
  const active = useActiveSection(sectionIds);

  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHeader
        eyebrow={<Eyebrow>Legal</Eyebrow>}
        title="Refund Policy"
        subtitle="When you make purchases on our platform, you agree to and must accept this refund policy."
      >
        <Badge tone="neutral">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Last updated: Oct 3, 2025
        </Badge>
      </PageHeader>

      <div className="container-x py-16 sm:py-20">
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          {/* Table of contents (large screens) */}
          <aside className="hidden lg:block print:hidden">
            <nav aria-label="Contents" className="sticky top-28 rounded-2xl border border-line bg-surface/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">On this page</p>
              <ul className="mt-4 space-y-1 border-l border-line">
                {sections.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors",
                          isActive ? "border-brand-600 font-semibold text-brand-700" : "border-transparent text-ink-3 hover:border-line hover:text-ink",
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <article className="max-w-3xl">
            <div className="space-y-12">
              <section id="final" className={sectionCls}>
                <h2 className={h2}>All sales are final</h2>
                <p className={p}>
                  Please read this section carefully before making any purchase. We do not offer refunds under any
                  circumstances.
                </p>
              </section>

              <section id="returns" className={sectionCls}>
                <h2 className={h2}>No returns or exchanges</h2>
                <p className={p}>
                  As we provide digital services and products, returns and exchanges do not apply. We do not offer any
                  kind of returns or exchanges once a purchase is completed.
                </p>
                <h3 className="mt-8 text-lg font-semibold tracking-tight text-ink">Important notes</h3>
                <Reveal>
                  <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)]">
                    {notes.map((note) => (
                      <li key={note} className="flex items-start gap-3 px-5 py-4 text-[15px] leading-6 text-ink-2">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
                        {note}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </section>

              <section id="clarification" className={sectionCls}>
                <h2 className={h2}>Need clarification?</h2>
                <p className={p}>
                  If you have questions about this policy,{" "}
                  <Link href="/contact" className={link}>
                    contact our support team
                  </Link>
                  .
                </p>
              </section>
            </div>

            <footer className="mt-16 flex flex-col gap-5 border-t border-line pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-ink-3">© {new Date().getFullYear()} Vereda Digital Learning. All rights reserved.</p>
              <div className="flex flex-wrap gap-3">
                <Button href="/terms-and-conditions" variant="outline" size="sm">
                  Terms of Use
                </Button>
                <Button href="/privacy" variant="outline" size="sm">
                  Privacy Policy
                </Button>
                <Button href="/contact" variant="ghost" size="sm">
                  Contact
                </Button>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
