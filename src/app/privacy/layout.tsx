// app/layout.tsx
import Navbar from "@/components/navbar/Navbar";
import { Metadata } from "next";
import React from "react";



export const metadata: Metadata = {
  title: "Privacy | Vereda Digital Learning",
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

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <>
        <Navbar/>

        <main className="">{children}</main>
      </>
  );
}
