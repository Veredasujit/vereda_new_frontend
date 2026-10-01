import type { Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
import ContactPopup from "@/contact-popup/ContactPopup";

export const metadata: Metadata = {
  title: "Live Webinars | Vereda Digital Learning",
  description:
    "Free and paid live webinars on Flutter, AI & ML and tech careers from Vereda mentors. Register, join live, watch recordings and earn a participation certificate.",
  keywords: ["Vereda webinars", "Flutter webinar", "AI webinar", "free webinar India", "live coding session", "webinar certificate"],
};

export default function WebinarsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-white">{children}</main>
      <ContactPopup defaultInterest="Webinar" />
    </>
  );
}
