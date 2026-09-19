import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import WellnessScan from "@/components/wellness/WellnessScan";

export const metadata: Metadata = {
  title: "Wellness Scan — Personalized Supplement Guidance | Nutraatoz",
  description:
    "Not sure what supplements you need? Take Nutraatoz's free Wellness Scan — answer a few questions, get your body metrics and a personalized nutrient report, and see verified products matched to you. General wellness guidance, not medical advice.",
  alternates: { canonical: "/wellness-scan" },
  openGraph: {
    title: "Wellness Scan — Personalized Supplement Guidance | Nutraatoz",
    description:
      "Answer a few questions, get your body metrics and a personalized nutrient report, and see verified products matched to you.",
    url: "https://nutraatoz.com/wellness-scan",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Nutraatoz Wellness Scan" }],
  },
};

export const dynamic = "force-dynamic";

export default function WellnessScanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)]">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden">
          <div className="orb orb-coral left-[-6rem] top-0 h-72 w-72 animate-float-slow" />
          <div className="orb orb-amber right-[-5rem] top-24 h-64 w-64 animate-float" />
          <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
            <WellnessScan />
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
