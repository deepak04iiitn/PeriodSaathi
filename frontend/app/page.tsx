import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import JoinedCounter from "@/components/JoinedCounter";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import PrivacySection from "@/components/PrivacySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <JoinedCounter />
        <HowItWorks />
        <Features />
        <PrivacySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
