// Webinar module UI helpers — thin wrappers over the site design system (@/ui)
// so every webinar page matches the rest of the site.

import type { ReactNode } from "react";
import type { Tone } from "@/webinars/lib/utils";
import { Badge as UIBadge, Button as UIButton, Card as UICard, EmptyState as UIEmpty, Skeleton as UISkeleton, buttonClass, cn } from "@/ui";

export { cn as cx };

const TONE_MAP: Record<Tone, "neutral" | "brand" | "success" | "warning" | "live" | "dark"> = {
  gray: "neutral",
  blue: "brand",
  green: "success",
  amber: "warning",
  red: "live",
  dark: "dark",
};

export function Badge({ tone = "gray", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <UIBadge tone={TONE_MAP[tone]} className={className}>
      {tone === "red" && <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />}
      {children}
    </UIBadge>
  );
}

type BtnVariant = "primary" | "blue" | "secondary" | "ghost" | "danger";
const VARIANT: Record<BtnVariant, "dark" | "primary" | "outline" | "ghost" | "danger"> = {
  primary: "dark",
  blue: "primary",
  secondary: "outline",
  ghost: "ghost",
  danger: "danger",
};

export function btn(variant: BtnVariant = "primary", size: "sm" | "md" | "lg" = "md") {
  return buttonClass(VARIANT[variant], size);
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <UIButton variant={VARIANT[variant]} size={size} href={href} className={className} {...rest}>
      {children}
    </UIButton>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <UICard className={className}>{children}</UICard>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <UIEmpty title={title} text={text} action={action} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <UISkeleton className={className} />;
}

export function Avatar({ name, photo, size = 44, ring = false }: { name: string; photo?: string; size?: number; ring?: boolean }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gradient font-semibold text-white", ring && "ring-4 ring-white")}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
      {photo && (
        // plain img so a missing file quietly falls back to initials
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="absolute inset-0 h-full w-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
      )}
    </span>
  );
}
