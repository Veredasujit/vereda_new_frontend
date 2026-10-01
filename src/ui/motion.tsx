"use client";

// Motion primitives shared by every page. Keep motion subtle: short distances,
// ease-out curves, run once on scroll. Respects prefers-reduced-motion.

import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={container} initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Animated number that counts up when scrolled into view. Accepts "5000+", "4.9/5", "7+". */
export function CountUp({ value, className, duration = 1.4 }: { value: string | number; className?: string; duration?: number }) {
  const str = String(value);
  const match = str.match(/^([^\d]*)([\d,.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const target = match ? parseFloat(match[2].replace(/,/g, "")) : 0;
  const decimals = match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const useGrouping = !!match && match[2].includes(",");
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(match ? "0" : str);

  useEffect(() => {
    if (!match) return;
    const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping });
    if (!inView) return;
    if (reduce) {
      setDisplay(fmt(target));
      return;
    }
    const controls = animate(mv, target, { duration, ease: "easeOut", onUpdate: (v) => setDisplay(fmt(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target]);

  if (!match) return <span className={className}>{str}</span>;
  return (
    <span ref={ref} className={className}>
      {match[1]}
      {display}
      {match[3]}
    </span>
  );
}

/** Moves children slightly against scroll for depth (images, mockups). */
export function Parallax({ children, offset = 40, className }: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Card wrapper that lifts slightly on hover. */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className={className}>
      {children}
    </motion.div>
  );
}

export { motion, AnimatePresence } from "framer-motion";
