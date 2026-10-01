"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { Reveal, buttonClass } from "@/ui";

type FooterLink = { href: string; label: string; external?: boolean };

const sections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Learn",
    links: [
      { href: "/view-courses", label: "Courses" },
      { href: "/webinars", label: "Webinars" },
      { href: "/flutter-courses-structures", label: "Curriculum" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about-us", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "https://api.whatsapp.com/send/?phone=%2B919570994444", label: "WhatsApp support", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms-and-conditions", label: "Terms & conditions" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
];

const socialLinks: { href: string; label: string; icon: IconType }[] = [
  { href: "https://www.facebook.com/veredaindia?mibextid=LQQJ4d", label: "Facebook", icon: FaFacebook },
  { href: "https://www.instagram.com/veredaindia", label: "Instagram", icon: FaInstagram },
  { href: "https://www.linkedin.com/company/vereda-management-india/", label: "LinkedIn", icon: FaLinkedin },
];

export default function Footer() {
  const pathname = usePathname();
  const inApp = pathname?.startsWith("/dashboard");
  const noCta = inApp || ["/login", "/register", "/verify-otp", "/payment-page", "/test"].some((p) => pathname?.startsWith(p));
  const year = new Date().getFullYear();

  // inside the dashboard: a slim footer, not the marketing one
  if (inApp) {
    return (
      <footer className="border-t border-line bg-white">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Vereda Digital Learning</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-ink">Terms</Link>
            <a href="https://api.whatsapp.com/send/?phone=%2B919570994444" target="_blank" rel="noopener noreferrer" className="hover:text-ink">Support</a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[120px]" aria-hidden />

      <div className="container-x relative">
        {!noCta && (
          <Reveal className="flex flex-col items-start justify-between gap-8 border-b border-white/10 py-16 sm:py-20 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-brand-200">Next batch is filling up</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl sm:leading-[1.02]">Start building apps people actually use.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/view-courses" className={buttonClass("white", "lg")}>
                Explore courses <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
              <a href="tel:+919570994444" className={buttonClass("outline", "lg", "border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5")}>
                <Phone className="h-4 w-4" /> Talk to a mentor
              </a>
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="inline-flex rounded-xl bg-white px-3 py-2" aria-label="Vereda Digital Learning home">
              <Image src="/images/logo.png" width={120} height={47} alt="Vereda Digital Learning" className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">Career-focused Flutter and AI programs from Patna, taught live by working developers.</p>
            <div className="mt-6 flex gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((s) => (
            <nav key={s.title} aria-label={s.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">{s.title}</h3>
              <ul className="mt-4 space-y-3">
                {s.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white">
                        {l.label}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Vereda Digital Learning. All rights reserved.</p>
          <p>9 Sinha Library Road, Venture Park, Patna</p>
        </div>
      </div>
    </footer>
  );
}
