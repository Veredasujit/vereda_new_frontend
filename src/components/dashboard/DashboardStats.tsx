"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CreditCard, type LucideIcon } from "lucide-react";
import { UserStats } from "../../types/index";
import { CountUp, IconTile, Skeleton, Stagger, StaggerItem } from "@/ui";

interface DashboardStatsProps {
  stats: UserStats;
  isLoading?: boolean;
}

interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  href: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading = false }) => {
  const statCards: StatCard[] = [
    {
      title: "Courses",
      value: Number.isFinite(stats.totalCourses) ? stats.totalCourses : 0,
      subtitle: "Enrolled",
      icon: BookOpen,
      href: "/dashboard/courses",
    },
    {
      title: "Payments",
      value: Number.isFinite(stats.totalPayments) ? stats.totalPayments : 0,
      subtitle: "Completed",
      icon: CreditCard,
      href: "/dashboard/billing",
    },
  ];

  return (
    <Stagger className="grid grid-cols-2 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <StaggerItem key={stat.title}>
            <Link
              href={stat.href}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)] sm:p-6"
            >
              <div className="flex items-start justify-between">
                <IconTile className="h-10 w-10">
                  <Icon className="h-5 w-5" aria-hidden />
                </IconTile>
                <ArrowUpRight className="h-4 w-4 text-ink-3 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
              </div>
              {isLoading ? (
                <Skeleton className="mt-5 h-9 w-14" />
              ) : (
                <CountUp value={stat.value} className="mt-5 block text-4xl font-semibold tracking-tight text-ink" />
              )}
              <p className="mt-1 text-sm text-ink-3">
                <span className="font-medium text-ink-2">{stat.title}</span> {stat.subtitle.toLowerCase()}
              </p>
            </Link>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
};

export default DashboardStats;
