// Core building blocks of the Vereda design system.
// Buttons are pill-shaped; cards are rounded-2xl with a hairline border and soft shadow.

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from "react";
import { AlertTriangle, Inbox, Loader2, RotateCw } from "lucide-react";
import { twMerge } from "tailwind-merge";

/** Joins class names; later Tailwind classes win over earlier conflicting ones. */
export const cn = (...c: unknown[]) => twMerge(c.filter((x): x is string => typeof x === "string" && x.length > 0).join(" "));

// ── Button ─────────────────────────────────────────────────────────────────
type Variant = "primary" | "dark" | "outline" | "ghost" | "white" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand-gradient text-white shadow-[var(--shadow-glow)] hover:brightness-110",
  dark: "bg-ink text-white hover:bg-black",
  outline: "border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50/40",
  ghost: "text-ink-2 hover:bg-surface hover:text-ink",
  white: "bg-white text-ink hover:bg-brand-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};
const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "group/btn inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "md", href, external, loading, className, children, disabled, ...rest }: ButtonProps) {
  const cls = buttonClass(variant, size, className);
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );
  if (href && !disabled) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

// ── Badge / eyebrow ────────────────────────────────────────────────────────
type Tone = "brand" | "neutral" | "success" | "warning" | "danger" | "live" | "dark";
const TONE: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  neutral: "bg-surface text-ink-2 ring-line",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-100",
  danger: "bg-red-50 text-red-700 ring-red-100",
  live: "bg-red-600 text-white ring-red-600",
  dark: "bg-ink text-white ring-ink",
};
export function Badge({ tone = "brand", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", TONE[tone], className)}>
      {children}
    </span>
  );
}

/** Small label above a section title. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700 backdrop-blur", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
      {children}
    </span>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────
export function Section({ id, children, className, tone = "white" }: { id?: string; children: ReactNode; className?: string; tone?: "white" | "surface" | "dark" }) {
  const bg = tone === "surface" ? "bg-surface" : tone === "dark" ? "bg-ink text-white" : "bg-white";
  return (
    <section id={id} className={cn("relative scroll-mt-24 py-20 sm:py-28", bg, className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
  dark = false,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const center = align === "center";
  return (
    <div className={cn("mb-12 flex flex-col gap-6 sm:mb-16", !center && action && "md:flex-row md:items-end md:justify-between", center && "items-center text-center", className)}>
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        {eyebrow && <div className="mb-4">{eyebrow}</div>}
        <h2 className={cn("text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.05]", dark ? "text-white" : "text-ink")}>{title}</h2>
        {subtitle && <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/70" : "text-ink-3")}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Hero band for inner pages (about, contact, legal, dashboard landing). */
export function PageHeader({ eyebrow, title, subtitle, children, className }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cn("relative overflow-hidden bg-mesh", className)}>
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative pb-14 pt-16 sm:pb-20 sm:pt-24">
        {eyebrow && <div className="mb-5">{eyebrow}</div>}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.02]">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-3">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className, interactive = false }: { children: ReactNode; className?: string; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)]",
        interactive && "transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Rounded icon tile used in feature cards. */
export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100", className)}>{children}</span>;
}

// ── Form fields ───────────────────────────────────────────────────────────
export const inputClass = (error?: string | boolean) =>
  cn(
    "h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-ink placeholder:text-ink-3/70 outline-none transition focus:ring-4",
    error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-line hover:border-brand-200 focus:border-brand-500 focus:ring-brand-100",
  );

export function Field({ label, hint, error, htmlFor, children, className }: { label: string; hint?: string; error?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-ink-3">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, className, ref, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: string | boolean; ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} aria-invalid={!!error || undefined} className={cn(inputClass(error), className)} {...rest} />;
}
export function Textarea({ error, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string | boolean }) {
  return <textarea className={cn(inputClass(error), "h-auto min-h-[110px] resize-none py-3", className)} {...rest} />;
}

// ── States ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface", className)} />;
}

export function EmptyState({ title, text, action, icon }: { title: string; text?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-ink-3">{icon ?? <Inbox className="h-5 w-5" />}</span>
      <p className="text-lg font-semibold text-ink">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-ink-3">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", text = "Please check your connection and try again.", onRetry, retrying }: { title?: string; text?: string; onRetry?: () => void; retrying?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-red-100 bg-red-50/40 px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-500 ring-1 ring-red-100">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-ink-3">{text}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6" onClick={onRetry} loading={retrying}>
          {!retrying && <RotateCw className="h-4 w-4" />} Try again
        </Button>
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-brand-600", className)} aria-label="Loading" />;
}
