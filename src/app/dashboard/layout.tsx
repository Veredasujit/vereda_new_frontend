// app/dashboard/layout.tsx (server layout)
import React, { ReactNode } from "react";
import DashboardClientLayout from "./DashboardClientLayout";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Dashboard | Vereda Digital Learning",
  description:
    "Learn about Vereda Digital Learning — empowering learners through modern tech education, skill-based training, and real-world career connections. Meet our leadership team and discover our mission, values, and mentor associates.",
  keywords: [
    "Vereda Digital Learning",
    "About Vereda",
    "tech education",
    "online learning platform",
    "digital learning",
    "career training",
    "skill development",
    "professional courses",
    "quality education",
    "accessible learning",
    "innovation in education",
    "student-centric training",
    "e-learning India",
    "Vereda mentors",
    "Vereda management team",
  ],
  
};

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
