"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Printer } from "lucide-react";
import { Badge, Button, Eyebrow, PageHeader, Reveal, cn } from "@/ui";

const sections = [
  { id: "collect", label: "What we collect" },
  { id: "consent", label: "Consent" },
  { id: "disclosure", label: "Disclosure" },
  { id: "payment", label: "Payment" },
  { id: "thirdparty", label: "Third-party services" },
  { id: "security", label: "Security and cookies" },
  { id: "age", label: "Age of consent" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Questions" },
];

const h2 = "text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]";
const h3 = "mt-8 text-lg font-semibold tracking-tight text-ink";
const p = "mt-4 text-base leading-7 text-ink-2";
const link = "font-medium text-brand-600 underline decoration-brand-200 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-500";
const sectionCls = "scroll-mt-28 border-t border-line pt-10 first:border-t-0 first:pt-0";

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

export default function PrivacyPolicyPage() {
  const active = useActiveSection(sectionIds);

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHeader
        eyebrow={<Eyebrow>Legal</Eyebrow>}
        title="Privacy Policy"
        subtitle="How Vereda.co.in collects, uses and protects your personal information."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="neutral">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Last updated: November 11, 2025
          </Badge>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4" aria-hidden /> Print policy
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
                This Privacy Policy explains how Vereda.co.in collects, uses, and protects your personal information
                when you use our services. We are committed to protecting your privacy and being transparent about how
                we handle your personal data, and we regularly review our privacy practices to ensure compliance with
                applicable laws.
              </p>
            </Reveal>

            <div className="mt-12 space-y-12">
              <section id="collect" className={sectionCls}>
                <h2 className={h2}>1. What information do we collect and what do we do with it?</h2>
                <p className={p}>
                  When you enroll as a student or subscriber (a &quot;learner&quot;) on our site or related courses, we
                  collect the personal information you provide such as your name, email address and payment details.
                </p>
                <p className={p}>
                  We use that information to register you for courses, deliver course content, process payments, send
                  course updates, and improve our services. Marketing emails are only sent if you opt in.
                </p>
              </section>

              <section id="consent" className={sectionCls}>
                <h2 className={h2}>2. How do you get my consent?</h2>
                <p className={p}>
                  By providing personal information when enrolling, purchasing, or contacting us, you consent to
                  collection and use for those purposes. For secondary uses (like marketing) we ask for express consent
                  and always provide a way to opt out.
                </p>
                <p className={p}>
                  To withdraw consent, email{" "}
                  <a href="mailto:support@vereda.co.in" className={link}>
                    support@vereda.co.in
                  </a>
                  .
                </p>
              </section>

              <section id="disclosure" className={sectionCls}>
                <h2 className={h2}>3. Disclosure</h2>
                <p className={p}>
                  We may disclose personal information if required by law or if you violate our Terms of Service.
                  Service providers may also access data only to the extent necessary.
                </p>
              </section>

              <section id="payment" className={sectionCls}>
                <h2 className={h2}>4. Payment</h2>
                <p className={p}>
                  If you make a purchase we use third-party payment processors such as Razorpay or PayU. Payment data is
                  handled according to PCI-DSS standards and retained only as long as needed to complete your
                  transaction.
                </p>
              </section>

              <section id="thirdparty" className={sectionCls}>
                <h2 className={h2}>5. Third-party services</h2>
                <p className={p}>
                  Third-party providers may collect and use your information only as required to perform their
                  services. They have their own privacy policies, and we recommend reviewing them. If services are
                  provided from another jurisdiction, your data may be subject to that jurisdiction&apos;s laws.
                </p>
                <p className={p}>Once redirected to a third-party site, their privacy practices apply.</p>
              </section>

              <section id="security" className={sectionCls}>
                <h2 className={h2}>6. Security</h2>
                <p className={p}>
                  We take reasonable steps and follow industry standards to protect your personal information. Payment
                  data is transmitted via SSL and stored using encryption where applicable. However, no method of online
                  transmission or storage is 100% secure.
                </p>
                <h3 className={h3}>Security measures</h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    "SSL encrypted connections",
                    "PCI-DSS compliant payment processing",
                    "Regular security assessments",
                    "Limited data access to authorized personnel",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 text-[15px] leading-6 text-ink-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className={h3}>Cookies</h3>
                <p className={p}>
                  We use cookies and tracking technologies to personalize your experience, measure engagement, and
                  serve targeted ads. You can manage cookies in your browser settings.
                </p>
                <p className={p}>
                  To opt out of targeted advertising, visit the Digital Advertising Alliance opt-out page or use
                  vendor-specific privacy controls.
                </p>

                <h3 className={h3}>Web analytics</h3>
                <p className={p}>
                  We may use analytics tools to measure anonymous session data and improve our site and services.
                </p>
              </section>

              <section id="age" className={sectionCls}>
                <h2 className={h2}>7. Age of consent</h2>
                <p className={p}>
                  By using this site, you confirm that you are at least the age of majority in your jurisdiction. We do
                  not knowingly collect data from users under 16.
                </p>
              </section>

              <section id="changes" className={sectionCls}>
                <h2 className={h2}>8. Changes to this Privacy Policy</h2>
                <p className={p}>
                  We may update this privacy policy at any time. Significant changes will be posted here. Continued use
                  indicates acceptance. If our business is acquired, your data may be transferred to new ownership.
                </p>
              </section>

              <section id="contact" className={sectionCls}>
                <h2 className={h2}>Questions and contact information</h2>
                <p className={p}>
                  For access, correction, deletion of data, or questions about this policy, contact our Privacy
                  Compliance Officer at{" "}
                  <a href="mailto:support@vereda.co.in" className={link}>
                    support@vereda.co.in
                  </a>
                  . We typically respond within 24–48 hours.
                </p>
              </section>
            </div>

            <footer className="mt-16 flex flex-wrap gap-3 border-t border-line pt-8 print:hidden">
              <Button href="/terms-and-conditions" variant="outline" size="sm">
                Terms of Use
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
