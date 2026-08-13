import { ArrowRight, Store, Sparkles } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="relative overflow-hidden rounded-[2.5rem] bg-citrus-gradient px-6 py-14 text-center shadow-glow-coral sm:px-16 sm:py-20">
          <div className="orb orb-amber right-[-3rem] top-[-3rem] h-56 w-56 opacity-40" />
          <div className="orb orb-berry bottom-[-4rem] left-[-2rem] h-56 w-56 opacity-40" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Join 40+ verified wellness brands
            </span>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Sell your supplements to a curated, high-intent audience.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 sm:text-base">
              Self-onboard in minutes with FSSAI + GST verification and get split
              settlements straight to your account. Zero setup fees.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/vendor/onboarding"
                className="shine inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-coral-700 shadow-float transition-transform hover:-translate-y-0.5"
              >
                <Store className="h-4 w-4" />
                Become a Vendor
              </a>
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Browse the store
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
