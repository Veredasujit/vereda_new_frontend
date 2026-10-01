"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, ChevronDown, ChevronRight, LogOut, LayoutDashboard, Settings, BookOpen, Video, Home } from "lucide-react";
import { RootState } from "@/Redux/store";
import { useLogoutMutation } from "../../Redux/api/authApi";
import { logout as logoutSlice } from "../../Redux/slices/authSlice";
import { AnimatePresence, motion, cn } from "@/ui";

interface DashboardNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const menuLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/webinars", label: "My Webinars", icon: Video },
  { href: "/dashboard/settings", label: "Profile settings", icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/courses": "My Courses",
  "/dashboard/webinars": "My Webinars",
  "/dashboard/assignments": "Assignments",
  "/dashboard/usergoal": "Goals",
  "/dashboard/Certificate": "Certificate",
  "/dashboard/webinar-certificates": "Webinar Certificates",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
};

const currentTitle = (pathname: string) => {
  const match = Object.keys(PAGE_TITLES).find((k) => pathname === k || pathname.startsWith(k + "/"));
  return match ? PAGE_TITLES[match] : null;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const userData = useSelector((state: RootState) => state.auth.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Render client-only content after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch(logoutSlice());
      router.push("/login");
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Close dropdown when navigating
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const safeUserData = {
    name: userData?.name || "User",
    email: userData?.email || "",
    profileURL: userData?.profileURL || "",
    role: userData?.role || "Student",
  };
  const initials =
    safeUserData.name
      .split(" ")
      .filter(Boolean)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const showAvatar = isMounted && !!safeUserData.profileURL && !avatarError;
  const title = currentTitle(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        {/* Left: drawer toggle, mobile logo, breadcrumbs */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-2 transition hover:border-brand-200 hover:text-ink lg:hidden"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center lg:hidden">
            <Image src="/images/logo.png" alt="Vereda" width={120} height={47} className="h-8 w-auto object-contain" priority />
          </Link>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex lg:pl-0">
            <span className="mx-1 h-5 w-px bg-line lg:hidden" aria-hidden />
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-ink-3 transition hover:bg-surface hover:text-ink">
              <Home className="h-4 w-4" aria-hidden />
              <span>Dashboard</span>
            </Link>
            {title && (
              <>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-3/60" aria-hidden />
                <span className="truncate font-medium text-ink" aria-current="page">
                  {title}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right: user menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="flex min-h-11 items-center gap-2.5 rounded-full border border-transparent py-1 pl-1 pr-2 transition hover:border-line hover:bg-white sm:pr-3"
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-gradient ring-2 ring-white">
              {showAvatar ? (
                <Image
                  src={safeUserData.profileURL}
                  alt={safeUserData.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-xs font-semibold text-white">{initials}</span>
              )}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[160px] truncate text-sm font-semibold leading-tight text-ink">{safeUserData.name}</span>
              <span className="block text-xs capitalize leading-tight text-ink-3">{safeUserData.role}</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform duration-200", isDropdownOpen && "rotate-180")} aria-hidden />
          </button>

          <AnimatePresence>
            {isMounted && isDropdownOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-lift)]"
              >
                <div className="border-b border-line px-4 py-3.5">
                  <p className="truncate text-sm font-semibold text-ink">{safeUserData.name}</p>
                  {safeUserData.email && <p className="truncate text-xs text-ink-3">{safeUserData.email}</p>}
                </div>

                <div className="p-1.5">
                  {menuLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-ink-2 transition hover:bg-surface hover:text-ink"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Icon className="h-4 w-4 text-ink-3" aria-hidden />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-line p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    role="menuitem"
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
