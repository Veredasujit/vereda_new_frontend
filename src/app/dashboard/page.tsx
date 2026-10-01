"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, MessageCircle, PlayCircle, Settings, Target, Video } from "lucide-react";
import { RootState } from "@/Redux/store";
import { useGetEnrollmentByIdQuery } from "@/Redux/api/enrollmentApi";
import { useGetPaymentsByUserIdQuery } from "@/Redux/api/billingApi";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { DashboardPageHeader } from "./DashboardClientLayout";
import { Badge, Button, IconTile, Reveal, Skeleton, Stagger, StaggerItem } from "@/ui";

const quickActions = [
  { href: "/view-courses", label: "Browse courses", text: "Find your next skill", icon: BookOpen },
  { href: "/webinars", label: "Webinars", text: "Live sessions", icon: Video },
  { href: "/dashboard/usergoal", label: "Goals", text: "Plan your progress", icon: Target },
  { href: "/dashboard/settings", label: "Settings", text: "Update your profile", icon: Settings },
];

const greetingFor = (hour: number) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

const DashboardPage: React.FC = () => {
  const now = new Date();
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const userData = useSelector((state: RootState) => state.auth.user);
  const userId = userData?.id;
  const firstName = (userData?.name || "").trim().split(" ")[0] || "there";

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetEnrollmentByIdQuery(userId, { skip: !userId });
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsByUserIdQuery(userId, { skip: !userId });

  const enrollments = Array.isArray(enrollmentsData?.enrollments) ? enrollmentsData.enrollments : [];
  const enrollmentCount = enrollments.length;
  const totalPayments = Array.isArray(payments) ? payments.length : 0;
  const latestCourseTitle: string | undefined = enrollments.find((e: { course?: { title?: string } }) => e?.course?.title)?.course?.title;

  const stats = { totalCourses: enrollmentCount, totalPayments };

  const memberSince = (() => {
    if (!userData?.createdAt) return null;
    const date = new Date(userData.createdAt);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  })();

  const phoneNumber = "+919570994444"; // WhatsApp number
  const message = "Hi! I want to join the Flutter + AI Community and get updates about Live Classes.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {currentDate}
          </span>
        }
        title={`${greetingFor(now.getHours())}, ${firstName}`}
        subtitle="Here is your learning at a glance."
        action={memberSince ? <Badge tone="neutral">Member since {memberSince}</Badge> : undefined}
      />

      {/* Hero + stats */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-200/50 blur-3xl" aria-hidden />
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden />
            <div className="relative flex h-full flex-col">
              <Badge tone="brand" className="self-start">
                <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                Continue learning
              </Badge>
              {enrollmentsLoading && userId ? (
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <>
                  <h2 className="mt-5 max-w-md text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {latestCourseTitle ? latestCourseTitle : "Start your first course"}
                  </h2>
                  <p className="mt-2 text-[15px] text-ink-3">
                    {enrollmentCount > 0
                      ? `${enrollmentCount} ${enrollmentCount === 1 ? "course" : "courses"} in your library.`
                      : "Pick a course and start building real skills."}
                  </p>
                </>
              )}
              <div className="mt-8 flex flex-wrap gap-3 sm:mt-auto sm:pt-8">
                <Button href="/dashboard/courses" size="lg">
                  My courses
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                </Button>
                <Button href="/view-courses" variant="outline" size="lg">
                  Explore
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-2">
          <DashboardStats stats={stats} isLoading={!!userId && (enrollmentsLoading || paymentsLoading)} />
        </div>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="mb-3 mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-ink-3">
          Quick actions
        </h2>
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {quickActions.map(({ href, label, text, icon: Icon }) => (
            <StaggerItem key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)] sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <IconTile className="transition-colors group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </IconTile>
                  <ArrowUpRight className="h-4 w-4 text-ink-3 opacity-0 transition group-hover:opacity-100" aria-hidden />
                </div>
                <p className="mt-4 text-[15px] font-semibold text-ink">{label}</p>
                <p className="mt-0.5 text-sm text-ink-3">{text}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* WhatsApp community */}
      <Reveal>
        <section className="relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden />
          <div className="relative flex items-center gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
              <MessageCircle className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Join our WhatsApp community</h2>
              <p className="mt-0.5 text-sm text-white/65">Live class updates and announcements.</p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Join on WhatsApp
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </section>
      </Reveal>
    </div>
  );
};

export default DashboardPage;
