"use client";

// Animated modal: blurred backdrop, spring entrance, closes on X, Esc and outside click.
// Locks page scroll and returns focus to the element that opened it.

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "./primitives";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeDisabled = false,
  aside,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  closeDisabled?: boolean;
  /** optional left panel (desktop only) for split layouts */
  aside?: ReactNode;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<Element | null>(null);
  // keep latest handler without re-running the open effect (which would steal focus)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closeDisabled) onCloseRef.current();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("input,textarea,button")?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open, closeDisabled]);

  if (!mounted) return null;

  const width = size === "sm" ? "sm:max-w-md" : size === "lg" ? (aside ? "sm:max-w-4xl" : "sm:max-w-2xl") : aside ? "sm:max-w-3xl" : "sm:max-w-lg";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onMouseDown={() => !closeDisabled && onClose()} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn("relative flex max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-3xl", width)}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98, transition: { duration: 0.14, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {aside && <div className="relative hidden w-[42%] shrink-0 overflow-hidden sm:block">{aside}</div>}
            <div className="relative flex-1 overflow-y-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-2 transition hover:rotate-90 hover:bg-line hover:text-ink disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
              {(title || description) && (
                <div className="px-6 pb-2 pr-16 pt-7 sm:px-8 sm:pt-8">
                  {title && (
                    <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-ink">
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{description}</p>}
                </div>
              )}
              <div className="px-6 pb-7 pt-4 sm:px-8 sm:pb-8">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
