'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCreateContactMutation } from '@/Redux/api/contactApi';
import toast from 'react-hot-toast';
import Navbar from '@/components/navbar/Navbar';
import {
  Accordion,
  AnimatePresence,
  Button,
  Card,
  Eyebrow,
  Field,
  Input,
  PageHeader,
  Reveal,
  Section,
  SectionHeader,
  Stagger,
  StaggerItem,
  Textarea,
  cn,
  motion,
} from '@/ui';

// Leaflet needs the browser, so the map is loaded client-side only
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-surface text-sm text-ink-3">Loading map...</div>
  ),
});

interface FormData {
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const emptyForm: FormData = { name: '', email: '', mobile: '', subject: '', message: '' };
const MESSAGE_MAX = 1000;

const contactInfo = {
  phoneDisplay: '+91 95709 94444',
  phone: '+919570994444',
  whatsapp: 'https://wa.me/919570994444',
  email: 'support@vereda.co.in',
  website: 'https://www.vereda.co.in',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=9+Sinha+Library+Road+Venture+Park+Lodipur+Patna+Bihar+800001',
};

const methods = [
  {
    icon: Phone,
    label: 'Call us',
    value: contactInfo.phoneDisplay,
    href: `tel:${contactInfo.phone}`,
    external: false,
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat with our team',
    href: contactInfo.whatsapp,
    external: true,
  },
  {
    icon: Mail,
    label: 'Email',
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    external: false,
  },
  {
    icon: MapPin,
    label: 'Visit',
    value: '9 Sinha Library Road, Venture Park, Lodipur, Patna, Bihar 800001',
    href: contactInfo.mapsUrl,
    external: true,
  },
];

const faqs = [
  {
    q: 'How fast do you reply?',
    a: 'We reply to every message within 24 hours. For quicker help, call or WhatsApp us during working hours.',
  },
  {
    q: 'Can I visit the office?',
    a: 'Yes. Our office is at 9 Sinha Library Road, Venture Park, Lodipur, Patna. Send a message first so the right person is available to meet you.',
  },
  {
    q: 'Do you offer counselling calls?',
    a: 'Yes. Share your goals in the form and our team will call you to help you choose the right course.',
  },
];

// Accepts "9876543210", "+91 98765 43210", "09876543210" and returns the 10-digit number
const normalizeMobile = (value: string) => {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const validate = (data: FormData): FormErrors => {
  const errors: FormErrors = {};
  const name = data.name.trim();
  const email = data.email.trim();
  const mobile = normalizeMobile(data.mobile);
  const subject = data.subject.trim();
  const message = data.message.trim();

  if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!/^[6-9]\d{9}$/.test(mobile)) errors.mobile = 'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.';
  if (!subject) errors.subject = 'Please add a subject.';
  if (!message) errors.message = 'Please write a message.';
  else if (message.length > MESSAGE_MAX) errors.message = `Message must be ${MESSAGE_MAX} characters or fewer.`;

  return errors;
};

const getServerError = (err: unknown): string => {
  if (err && typeof err === 'object') {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    if ((err as { status?: unknown }).status === 'FETCH_ERROR') {
      return 'Could not reach the server. Check your connection and try again.';
    }
  }
  return 'Failed to send message. Please try again.';
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [createContact, { isLoading }] = useCreateContactMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setServerError(null);
    try {
      const res = await createContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: normalizeMobile(formData.mobile),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      }).unwrap();

      if (res && res.success === false) {
        const msg = res.message || 'Failed to send message. Please try again.';
        setServerError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Message sent. We'll get back to you within 24 hours.");
      setFormData(emptyForm);
      setErrors({});
      setSubmitted(true);
    } catch (err) {
      const msg = getServerError(err);
      setServerError(msg);
      toast.error(msg);
    }
  };

  const sendAnother = () => {
    setSubmitted(false);
    setServerError(null);
    setErrors({});
    setFormData(emptyForm);
  };

  const messageLength = formData.message.trim().length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden bg-white">
        <PageHeader
          eyebrow={<Eyebrow>Contact</Eyebrow>}
          title={
            <>
              Let&apos;s <span className="text-gradient-brand">talk</span>
            </>
          }
          subtitle="Questions about our courses? We reply within 24 hours."
        />

        <section className="pb-20 sm:pb-28">
          <div className="container-x">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
              {/* Left: contact methods + map */}
              <div className="space-y-6 lg:col-span-2">
                <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {methods.map((m) => {
                    const Icon = m.icon;
                    return (
                      <StaggerItem key={m.label}>
                        <a
                          href={m.href}
                          {...(m.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="group flex min-h-[72px] items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)] sm:p-5"
                        >
                          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium uppercase tracking-wide text-ink-3">
                              {m.label}
                            </span>
                            <span className="mt-0.5 block break-words text-[15px] font-semibold text-ink">
                              {m.value}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
                            aria-hidden
                          />
                        </a>
                      </StaggerItem>
                    );
                  })}
                </Stagger>

                <Reveal>
                  <div className="relative z-0 overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-[var(--shadow-soft)]">
                    {isClient && <Map />}
                  </div>
                </Reveal>
              </div>

              {/* Right: form */}
              <div className="lg:col-span-3">
                <Reveal delay={0.08}>
                  <Card className="relative overflow-hidden rounded-3xl p-6 shadow-[var(--shadow-lift)] sm:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient" aria-hidden />
                    <AnimatePresence mode="wait" initial={false}>
                      {submitted && !serverError ? (
                        <motion.div
                          key="success"
                          role="status"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.35 }}
                          className="flex flex-col items-center py-12 text-center sm:py-16"
                        >
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50"
                          >
                            <svg viewBox="0 0 24 24" className="h-8 w-8 text-accent" fill="none" aria-hidden>
                              <motion.path
                                d="M5 12.5l4.5 4.5L19 7.5"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                              />
                            </svg>
                          </motion.span>
                          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Message sent</h2>
                          <p className="mt-2 max-w-sm text-[15px] text-ink-3">
                            Thanks, your message has been sent. We&apos;ll reply within 24 hours.
                          </p>
                          <Button variant="outline" className="mt-8" onClick={sendAnother}>
                            Send another
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.35 }}
                        >
                          <h2 className="text-2xl font-semibold tracking-tight text-ink">Send us a message</h2>
                          <p className="mt-1.5 text-sm text-ink-3">All fields are required.</p>

                          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                              <Field label="Name" htmlFor="name" error={errors.name}>
                                <Input
                                  type="text"
                                  id="name"
                                  name="name"
                                  autoComplete="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  disabled={isLoading}
                                  error={!!errors.name}
                                  aria-invalid={!!errors.name}
                                  placeholder="Your full name"
                                />
                              </Field>
                              <Field label="Email" htmlFor="email" error={errors.email}>
                                <Input
                                  type="email"
                                  id="email"
                                  name="email"
                                  autoComplete="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  disabled={isLoading}
                                  error={!!errors.email}
                                  aria-invalid={!!errors.email}
                                  placeholder="you@example.com"
                                />
                              </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                              <Field label="Mobile number" htmlFor="mobile" error={errors.mobile}>
                                <Input
                                  type="tel"
                                  id="mobile"
                                  name="mobile"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  maxLength={16}
                                  value={formData.mobile}
                                  onChange={handleChange}
                                  disabled={isLoading}
                                  error={!!errors.mobile}
                                  aria-invalid={!!errors.mobile}
                                  placeholder="98765 43210"
                                />
                              </Field>
                              <Field label="Subject" htmlFor="subject" error={errors.subject}>
                                <Input
                                  type="text"
                                  id="subject"
                                  name="subject"
                                  maxLength={150}
                                  value={formData.subject}
                                  onChange={handleChange}
                                  disabled={isLoading}
                                  error={!!errors.subject}
                                  aria-invalid={!!errors.subject}
                                  placeholder="What can we help with?"
                                />
                              </Field>
                            </div>

                            <Field label="Message" htmlFor="message" error={errors.message}>
                              <Textarea
                                id="message"
                                name="message"
                                rows={6}
                                value={formData.message}
                                onChange={handleChange}
                                disabled={isLoading}
                                error={!!errors.message}
                                aria-invalid={!!errors.message}
                                placeholder="Tell us a little about what you're looking for."
                                className="min-h-[150px]"
                              />
                              <p
                                className={cn(
                                  'mt-1.5 text-right text-xs tabular-nums',
                                  messageLength > MESSAGE_MAX ? 'text-red-600' : 'text-ink-3',
                                )}
                                aria-live="polite"
                              >
                                {messageLength}/{MESSAGE_MAX}
                              </p>
                            </Field>

                            {serverError && (
                              <p
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                              >
                                {serverError}
                              </p>
                            )}

                            <div className="flex flex-col-reverse items-stretch gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs text-ink-3">We reply within 24 hours.</p>
                              <Button type="submit" size="lg" loading={isLoading} disabled={isLoading}>
                                {isLoading ? (
                                  'Sending...'
                                ) : (
                                  <>
                                    Send message <Send className="h-4 w-4" aria-hidden />
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <Section tone="surface">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <SectionHeader
              eyebrow={<Eyebrow>FAQ</Eyebrow>}
              title="Quick answers"
              subtitle="Still unsure? Call or WhatsApp us."
              className="mb-0 sm:mb-0"
            />
            <Reveal>
              <Accordion items={faqs} />
            </Reveal>
          </div>
        </Section>
      </div>
    </>
  );
}
