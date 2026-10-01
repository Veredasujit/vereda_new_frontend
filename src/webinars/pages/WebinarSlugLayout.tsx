import type { Metadata } from "next";
import { getWebinarBySlug } from "@/webinars/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = getWebinarBySlug(slug);
  if (!w) return { title: "Webinar not found | Vereda Digital Learning" };
  return {
    title: `${w.title} | Vereda Webinars`,
    description: w.subtitle,
    openGraph: { title: w.title, description: w.subtitle, type: "website" },
  };
}

export default function WebinarSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
