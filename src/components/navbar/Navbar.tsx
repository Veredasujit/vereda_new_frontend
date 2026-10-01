"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, Video, X } from "lucide-react";
import { useLogoutMutation } from "../../Redux/api/authApi";
import { logout as logoutSlice } from "../../Redux/slices/authSlice";
import { buttonClass, cn } from "@/ui";

const links = [
  { href: "/", label: "Home" },
  { href: "/view-courses", label: "Courses" },
  { href: "/webinars", label: "Webinars" },
  { href: "/about-us", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // user comes from localStorage → read after mount
  useEffect(() => {
    try {
      const name = JSON.parse(localStorage.getItem("user") || "null")?.name;
      setUserName(typeof name === "string" && name.trim() ? name.trim() : null);
    } catch {
      setUserName(null);
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  // mobile sheet: lock scroll + Esc
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // user dropdown: outside click + Esc
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || !!pathname?.startsWith(`${href}/`));
  const activeHref = links.find((l) => isActive(l.href))?.href ?? null;
  const pill = hovered ?? activeHref;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      /* server logout failed — still clear local session */
    } finally {
      dispatch(logoutSlice());
      setUserName(null);
      router.push("/login");
    }
  };

  const initial = userName?.charAt(0).toUpperCase() ?? "";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        // no backdrop-blur while the menu is open: it would trap the fixed mobile sheet inside the bar
        open ? "border-b border-line bg-white" : scrolled ? "border-b border-line bg-white/80 backdrop-blur-xl" : "border-b border-transparent bg-white",
      )}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Link href="/" aria-label="Vereda home" className="shrink-0">
          <Image src="/images/logo.png" alt="Vereda Digital Learning" width={132} height={52} className="h-11 w-auto object-contain" priority />
        </Link>

        {/* desktop links with sliding pill */}
        <div className="hidden items-center rounded-full border border-line bg-white/70 p-1 lg:flex" onMouseLeave={() => setHovered(null)}>
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => setHovered(l.href)}
                className={cn("relative rounded-full px-4 py-2 text-sm font-medium transition-colors", active ? "text-ink" : "text-ink-3 hover:text-ink")}
              >
                {pill === l.href && (
                  <motion.span layoutId="nav-pill" className={cn("absolute inset-0 rounded-full", active && !hovered ? "bg-brand-50" : "bg-surface")} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {userName ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-sm font-medium text-ink transition hover:border-brand-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">{initial}</span>
                <span className="max-w-[120px] truncate">{userName.split(" ")[0]}</span>
                <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform", menu && "rotate-180")} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)]"
                  >
                    <p className="truncate px-3 pb-2 pt-1.5 text-xs text-ink-3">Signed in as {userName}</p>
                    <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
                    <MenuLink href="/dashboard/webinars" icon={<Video className="h-4 w-4" />}>My webinars</MenuLink>
                    <button role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login" className={buttonClass("ghost", "sm")}>
                Log in
              </Link>
              <Link href="/register" className={buttonClass("dark", "sm", "pr-3")}>
                Get started <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-[68px] z-50 overflow-y-auto bg-white lg:hidden"
          >
            <motion.ul
              className="container-x flex flex-col gap-1 pt-6"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            >
              {links.map((l) => (
                <motion.li key={l.href} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn("flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-semibold tracking-tight", isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-surface")}
                  >
                    {l.label}
                    <ArrowRight className="h-5 w-5 opacity-40" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="container-x mt-6 border-t border-line pb-10 pt-6">
              {userName ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-1 pb-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient font-semibold text-white">{initial}</span>
                    <span className="font-medium text-ink">{userName}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className={buttonClass("dark", "lg", "w-full")}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className={buttonClass("outline", "lg", "w-full")}>
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className={buttonClass("outline", "lg")}>
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className={buttonClass("primary", "lg")}>
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-2 hover:bg-surface hover:text-ink">
      <span className="text-ink-3">{icon}</span>
      {children}
    </Link>
  );
}
