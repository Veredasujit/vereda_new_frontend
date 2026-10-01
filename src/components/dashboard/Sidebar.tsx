"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  ClipboardList,
  Target,
  Award,
  BadgeCheck,
  Settings,
  CreditCard,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { RootState } from "@/Redux/store";
import { useLogoutMutation } from "@/Redux/api/authApi";
import { logout as logoutSlice } from "@/Redux/slices/authSlice";
import { AnimatePresence, motion, cn } from "@/ui";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuItem = { name: string; href: string; icon: LucideIcon };

const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "My Webinars", href: "/dashboard/webinars", icon: Video },
  { name: "My Assignments", href: "/dashboard/assignments", icon: ClipboardList },
  { name: "Goals", href: "/dashboard/usergoal", icon: Target },
  { name: "Certificate", href: "/dashboard/Certificate", icon: Award },
  { name: "Webinar Certificates", href: "/dashboard/webinar-certificates", icon: BadgeCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

const byHref = (href: string) => menuItems.find((m) => m.href === href)!;

const groups: { label: string; items: MenuItem[] }[] = [
  {
    label: "Learn",
    items: ["/dashboard", "/dashboard/courses", "/dashboard/webinars", "/dashboard/assignments", "/dashboard/usergoal"].map(byHref),
  },
  { label: "Achievements", items: ["/dashboard/Certificate", "/dashboard/webinar-certificates"].map(byHref) },
  { label: "Account", items: ["/dashboard/settings", "/dashboard/billing"].map(byHref) },
];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

function SidebarContent({ variant, onNavigate, onClose }: { variant: "desktop" | "mobile"; onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const name = user?.name || "User";

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

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <Link href="/" className="flex items-center" onClick={onNavigate}>
          <Image src="/images/logo.png" alt="Vereda" width={120} height={47} className="h-9 w-auto object-contain" priority={variant === "desktop"} />
        </Link>
        {variant === "mobile" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Dashboard navigation">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3/80">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                        active ? "text-brand-700" : "text-ink-2 hover:bg-surface hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId={`sidebar-active-${variant}`}
                          className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-inset ring-brand-100"
                          transition={{ type: "spring", stiffness: 420, damping: 36 }}
                          aria-hidden
                        />
                      )}
                      <Icon
                        className={cn("relative h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-brand-600" : "text-ink-3 group-hover:text-ink-2")}
                        aria-hidden
                      />
                      <span className="relative truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
            {initialsOf(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {user?.email && <p className="truncate text-xs text-ink-3">{user.email}</p>}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label={isLoggingOut ? "Logging out" : "Log out"}
            title="Log out"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-3 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  // Lock page scroll and allow Esc to close while the mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop: sticky rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-white lg:block">
        <SidebarContent variant="desktop" />
      </aside>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard menu"
              className="absolute inset-y-0 left-0 w-[86%] max-w-xs bg-white shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <SidebarContent variant="mobile" onNavigate={onClose} onClose={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
