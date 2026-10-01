'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const socialLinks = [
  { icon: FaFacebook, label: 'Facebook', href: 'https://www.facebook.com/veredaindia?mibextid=LQQJ4d' },
  { icon: FaLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/vereda-management-india/' },
  { icon: FaInstagram, label: 'Instagram', href: 'https://www.instagram.com/veredaindia' },
];

/** Slim announcement bar above the main navigation (home page). */
export default function Nav() {
  return (
    <div className="bg-ink text-[13px] text-white/75">
      <div className="container-x flex h-10 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <a href="tel:+919570994444" className="flex items-center gap-2 whitespace-nowrap font-medium text-white transition-colors hover:text-brand-200">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            +91 95709 94444
          </a>
          <p className="hidden items-center gap-2 truncate md:flex">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            9 Sinha Library Road, Venture Park, Patna
          </p>
        </div>

        <Link href="/webinars" className="group hidden items-center gap-1.5 font-medium text-white lg:flex">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-200">New</span>
          Free live webinars every week
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="flex items-center gap-0.5">
          {socialLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
