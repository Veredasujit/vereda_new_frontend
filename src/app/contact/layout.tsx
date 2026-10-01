
import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
 title: "Contact Vereda Digital Learning | Get in Touch with Our Team",
  description: "Reach out to Vereda Digital Learning for inquiries, support, or collaboration. Connect with our team, explore our tech education programs, and start your learning journey today.",
  keywords: [
     "Contact Vereda Digital Learning",
     "get in touch Vereda",
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
       

        <main className="">{children}</main>
      </>
  );
}
