// app/layout.tsx
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Test | Vereda Digital Learning",
  description:
    "Learn about Vereda Digital Learning — empowering learners through modern tech education, skill-based training, and real-world career connections.",
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
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen text-gray-500">
              Loading test...
            </div>
          }
        >
          <main>{children}</main>
        </Suspense>
      </>
  );
}
