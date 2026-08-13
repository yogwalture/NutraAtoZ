"use client";

import dynamic from "next/dynamic";
import { ShieldCheck, Sparkles, ArrowRight, Star } from "lucide-react";

// WebGL object is client-only.
const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="h-44 w-44 animate-pulse-glow rounded-full bg-coral/30 blur-2xl" />
    </div>
  ),
});

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* animated citrus mesh + orbs */}
      <div className="absolute inset-0 bg-citrus-mesh" />
      <div className="orb orb-coral left-[-6rem] top-[-4rem] h-72 w-72 animate-float-slow" />
      <div className="orb orb-amber right-[-5rem] top-20 h-72 w-72 animate-float" />
      <div className="orb orb-berry bottom-[-7rem] left-1/3 h-72 w-72 animate-pulse-glow" />
      <div className="absolute inset-0 bg-grain opacity-60" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-coral-700 shadow-float backdrop-blur">
              <Sparkles className="h-4 w-4 text-berry" />
              FSSAI-verified vendors · Third-party lab reports
            </span>

            <h1 className="mt-6 font-serif text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.4rem]">
              Wellness that{" "}
              <span className="text-gradient">tastes</span> like
              <br className="hidden sm:block" /> living{" "}
              <span className="text-gradient-warm">brighter</span>.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-mist sm:text-lg">
              A bold, curated marketplace of premium nutraceuticals — every
              supplement lab-tested, every vendor verified. Fuel your goals with
              the cleanest, most vibrant wellness in India.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/products"
                className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-8 py-4 text-sm font-bold text-white shadow-glow-coral transition-all hover:-translate-y-0.5 hover:shadow-glow-berry"
              >
                Shop Supplements
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#categories"
                className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-white/70 px-8 py-4 text-sm font-bold text-coral-700 shadow-float backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Explore Categories
              </a>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                ["180+", "Lab-Tested SKUs"],
                ["40+", "Verified Vendors"],
                ["4.9", "Avg. Rating", true],
              ].map(([stat, label, star]) => (
                <div
                  key={label as string}
                  className="glass rounded-2xl px-3 py-3.5 text-center"
                >
                  <dt className="flex items-center justify-center gap-1 font-serif text-2xl font-semibold text-ink">
                    {stat}
                    {star ? (
                      <Star className="h-4 w-4 fill-amber text-amber" />
                    ) : null}
                  </dt>
                  <dd className="mt-0.5 text-[11px] font-medium text-mist">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 3D visual */}
          <div className="relative">
            <div className="perspective relative">
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white/80 via-[#FFF1E6]/70 to-[#FFE3EE]/70 shadow-float">
                <div className="absolute inset-0 bg-grain opacity-40" />
                <div className="absolute inset-0">
                  <Hero3D />
                </div>
                <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-coral-700 shadow-float backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-berry" />
                  Lab-tested purity
                </span>
              </div>
            </div>

            {/* Floating trust chip */}
            <div className="animate-float absolute -bottom-4 -left-2 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-float backdrop-blur sm:-left-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-citrus-gradient text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">
                  Certificate of Analysis
                </p>
                <p className="text-xs text-mist">on every product page</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
