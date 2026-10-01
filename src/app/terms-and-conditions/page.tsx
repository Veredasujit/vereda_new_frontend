"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Printer } from "lucide-react";
import { Badge, Button, Eyebrow, PageHeader, Reveal, cn } from "@/ui";

const sections = [
  {
    id: "use-of-site",
    label: "Use of site",
    title: "1. Use of Site",
    content:
      "Vereda.co.in provides various materials, information, quizzes, tests, questions, articles, news and other information on this and related sites and in courses offered through this site (the 'Materials'). Vereda.co.in authorizes each User to view and download one copy of the Materials. Materials may be downloaded and a maximum of one copy of the Materials may be printed provided that Users make no modifications to the Materials and you retain all copyright and other proprietary notices contained in the original Materials on any copies of the Materials. Users may not modify the Materials at this Site in any way or reproduce, share or distribute them. Users will keep all Materials confidential, and will not sell, auction, loan, rent, give away, describe, summarize, or otherwise reveal the Materials or their contents, to any other person or entity. Any breach of these Terms of Use automatically terminates your authorized use of the Site.",
  },
  {
    id: "geographic-location",
    label: "Geographic location",
    title: "2. Geographic location",
    content:
      "If you, as a User, purchase Materials from this Site or Vereda.co.in while outside of India, you may not use or access the materials while inside India.",
  },
  {
    id: "user-warranty",
    label: "User warranty",
    title: "3. User Warranty",
    content:
      "As a User, you warrant that you are not an agent or employee of any other test preparation company and the Site and Materials solely for your own personal career advancement or personal use.",
  },
  {
    id: "trademark",
    label: "Trademark and copyright",
    title: "4. Trademark and Copyright",
    content:
      "Vereda.co.in, and certain other brands, trademarks, and service marks are marks of Vereda.co.in and its affiliates. The Materials on this Site are copyrighted, and any unauthorized use of any Materials on this Site may violate copyright, trademark, and other laws.",
  },
  {
    id: "hyperlinks",
    label: "Hyperlinks",
    title: "5. Hyperlinks",
    content:
      "Links to external websites are provided solely as a convenience to you. Vereda.co.in has not reviewed all of these external websites, does not control and is not responsible for any of these sites or their content. If you decide to access any of the external websites linked to this Site, you do so entirely at your own risk.",
  },
  {
    id: "no-warranty",
    label: "No warranty",
    title: "6. No Warranty",
    content:
      "The Materials provided at this site are provided 'as is' without any warranties of any kind including warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property. Vereda.co.in further does not warrant the accuracy and completeness of the Materials at this Site. Vereda.co.in may make changes to the Materials at this Site, or to the services and prices described in them, at any time without notice. The Materials at this Site may be out of date and Vereda.co.in makes no commitment to update the Materials at this Site.",
  },
  {
    id: "liability",
    label: "Limitation of liability",
    title: "7. Limitation of Liability",
    content:
      "In no event will Vereda.co.in, its suppliers or other third parties mentioned at this Site be liable for any damages whatsoever (including, without limitation, those resulting from lower test scores, interruption of services or inaccurate information) arising out of the use, inability to use, or the results of the use of this Site, any websites linked to this Site, or the Materials or information contained at any or all such sites, whether based on warranty, contract, tort or any other legal theory and whether or not advised of the possibility of such damages. If your use of the Materials or information from this Site results in the need for servicing, repair or correction of equipment or data, you assume all costs thereof.",
  },
  {
    id: "termination",
    label: "Account termination",
    title: "8. Account Termination",
    content:
      "Any and all accounts may be terminated for any reason(s), at any time, at the sole discretion of the administrators of this website.",
  },
  {
    id: "law",
    label: "Applicable law",
    title: "9. Applicable Law",
    content:
      "The Terms of Use are governed by the laws of India. Failure to enforce strict performance of the Terms of Use shall not be construed as a waiver of any provision or right. Vereda.co.in may assign its rights and duties under the Terms of Use without notice to any party at any time.",
  },
  {
    id: "updates",
    label: "Updates",
    title: "10. Effective Date and Updates",
    content:
      "The Terms are effective as of November 11th, 2022 and are subject to change without notice by Vereda.co.in at any time. Please check for changes regularly. Your use of this Site after such changes constitutes your agreement to such changes.",
  },
];

const p = "mt-4 text-base leading-7 text-ink-2";
const link = "font-medium text-brand-600 underline decoration-brand-200 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-500";

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

export default function TermsOfUsePage() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const active = useActiveSection(sectionIds);

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHeader
        eyebrow={<Eyebrow>Legal</Eyebrow>}
        title="Terms of Use"
        subtitle="The terms that apply when you use Vereda.co.in, its courses and related sites."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="neutral">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Effective date: November 11, 2025
          </Badge>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4" aria-hidden /> Print terms
          </Button>
        </div>
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
            <Reveal>
              <p className="text-lg leading-8 text-ink-2">
                Usage of this site is bounded by these Terms. Vereda.co.in maintains this website, any courses and
                other linked and related sites (the &quot;Site&quot;) for the use of its customers, vendors, students,
                and other site users (&quot;Users&quot;) upon agreement to the following terms. Please read the terms
                carefully before using the Site.
              </p>
              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4 text-[15px] leading-7 text-amber-900">
                Minors or people below 14 years old are not allowed to use this website.
              </div>
              <p className={p}>
                In addition to these terms, all purchases made on this site are governed by our{" "}
                <Link href="/refund-policy" className={link}>
                  refund policy
                </Link>{" "}
                and all activity is governed by our{" "}
                <Link href="/privacy" className={link}>
                  privacy policy
                </Link>
                .
              </p>
            </Reveal>

            <div className="mt-12 space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 border-t border-line pt-10"
                >
                  <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{section.title}</h2>
                  <p className={p}>{section.content}</p>
                </section>
              ))}
            </div>

            {/* Acceptance */}
            <section className="mt-16 rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8 print:hidden">
              <label htmlFor="accept-terms" className="flex cursor-pointer items-start gap-4">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-6 w-6 flex-shrink-0 cursor-pointer rounded-md border-line accent-[#101AC9]"
                />
                <span>
                  <span className="block text-base font-semibold text-ink">
                    I have read and agree to the Terms of Use for Vereda.co.in
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-ink-3">
                    By accepting, you acknowledge that you have read, understood, and agree to be bound by all terms
                    and conditions outlined above.
                  </span>
                </span>
              </label>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" disabled={!accepted} onClick={() => router.push("/")}>
                  Continue to site <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button href="/contact" variant="outline" size="lg">
                  Contact support
                </Button>
              </div>
            </section>

            <footer className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8 print:hidden">
              <Button href="/privacy" variant="outline" size="sm">
                Privacy Policy
              </Button>
              <Button href="/refund-policy" variant="outline" size="sm">
                Refund Policy
              </Button>
              <Button href="/contact" variant="ghost" size="sm">
                Contact us
              </Button>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
