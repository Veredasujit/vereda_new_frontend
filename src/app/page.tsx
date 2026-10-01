import CertificateSection from "@/components/home/CertificateSection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import Hero from "@/components/home/Hero";
import InstantDoubtSolve from "@/components/home/InstantDoubtSolve";
import Management from "@/components/home/Management";
import StatsSection from "@/components/home/StatsSection";
import WhychooseUs from "@/components/home/WhychooseUs";
import Nav from "@/components/navbar/Nav";
import Navbar from "@/components/navbar/Navbar";
import UpcomingWebinars from "@/webinars/components/UpcomingWebinars";
import ContactPopup from "@/contact-popup/ContactPopup";

export default function Home() {
  return (
    <>
      <Nav />
      <Navbar />
      <Hero />
      <StatsSection />
      <FeaturedCourses />
      <UpcomingWebinars />
      <WhychooseUs />
      <InstantDoubtSolve />
      <CertificateSection />
      <Management />
      <ContactPopup defaultInterest="Course" />
    </>
  );
}
