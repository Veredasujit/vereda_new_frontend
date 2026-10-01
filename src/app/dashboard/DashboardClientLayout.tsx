"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { RootState } from "@/Redux/store";
import { Reveal, cn } from "@/ui";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Consistent header for every dashboard page: title, one-line subtitle, optional action.
 * Exported so other dashboard pages (webinars, webinar certificates) can share it.
 */
export function DashboardPageHeader({
  title,
  subtitle,
  action,
  eyebrow,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal y={12} className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-sm font-medium text-ink-3">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-3">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </Reveal>
  );
}

const DashboardClientLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  // The user comes from localStorage, which the server can't read. Render only
  // after mount so server and client HTML match (avoids hydration error #418).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace("/login");
    }
  }, [mounted, user, router]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!mounted || !user) {
    return null; // nothing to show while redirecting
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />
        <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      {/* Toasts come from the root layout's <Toaster>; a second one here showed every toast twice. */}
    </div>
  );
};

export default DashboardClientLayout;
