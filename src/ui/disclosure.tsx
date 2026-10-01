"use client";

// Accordion (FAQ, curriculum) and Tabs with an animated active indicator.

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "./primitives";

export function Accordion({
  items,
  defaultOpen = 0,
  className,
}: {
  items: { q: ReactNode; a: ReactNode; meta?: ReactNode }[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();
  return (
    <div className={cn("divide-y divide-line rounded-3xl border border-line bg-white", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${base}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
            >
              <span className="flex-1">
                <span className="block text-base font-semibold text-ink sm:text-lg">{it.q}</span>
                {it.meta && <span className="mt-0.5 block text-sm text-ink-3">{it.meta}</span>}
              </span>
              <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300", isOpen ? "rotate-45 border-brand-600 bg-brand-600 text-white" : "border-line text-ink-2")}>
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${base}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 text-[15px] leading-relaxed text-ink-3 sm:px-7">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  size = "md",
}: {
  tabs: { id: T; label: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const layoutId = useId();
  return (
    <div role="tablist" className={cn("scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1", className)}>
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn("relative whitespace-nowrap rounded-full font-medium transition-colors", size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-5 py-2 text-sm", active ? "text-white" : "text-ink-2 hover:text-ink")}
          >
            {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
