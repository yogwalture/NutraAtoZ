import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import WellnessFinder from "@/components/finder/WellnessFinder";
import { getStoreProducts } from "@/lib/publicData";

export const metadata: Metadata = {
  title: "Wellness Finder — Nutraatoz",
  description:
    "Answer a few quick questions and we'll suggest verified nutraceuticals matched to your wellness goals.",
};

export const revalidate = 60;

export default async function FinderPage() {
  const products = await getStoreProducts(300);

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-citrus-soft">
          <div className="orb orb-coral left-[-5rem] top-[-2rem] h-64 w-64 animate-float opacity-40" />
          <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 text-center sm:px-8 sm:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-coral-600">
              <Sparkles className="h-4 w-4" />
              Wellness Finder
            </span>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Find your <span className="text-gradient">right fit</span>
            </h1>
            <p className="mt-3 text-sm text-mist sm:text-base">
              Answer a few quick questions and we&apos;ll match you with verified
              products from FSSAI-verified vendors. Takes about 30 seconds.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <WellnessFinder products={products} />
        </section>
        <Footer />
      </main>
    </div>
  );
}
