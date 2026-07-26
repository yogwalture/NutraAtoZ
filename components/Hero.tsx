"use client";

import dynamic from "next/dynamic";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

// WebGL object is client-only.
const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="h-40 w-40 animate-pulse-glow rounded-full bg-gold/30 blur-2xl" />
    </div>
  ),
});

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* animated gradient orbs */}
      <div className="orb orb-emerald left-[-6rem] top-[-4rem] h-72 w-72 animate-float-slow" />
      <div className="orb orb-gold right-[-4rem] top-24 h-64 w-64 animate-float" />
      <div className="orb orb-emerald bottom-[-6rem] left-1/3 h-72 w-72 animate-pulse-glow" />
      <div className="absolute inset-0 bg-grain" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3.5 py-1.5 text-xs font-medium text-emerald shadow-float backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              FSSAI-verified vendors · Third-party lab reports
            </span>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.03] tracking-tight text-emerald sm:text-5xl lg:text-[4rem]">
              Wellness you can{" "}
              <span className="text-gradient">trust</span>, sourced with care.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">
              A curated marketplace of premium nutraceuticals — every supplement
              lab-tested, every vendor verified. Discover the cleanest path to
              your wellness goals.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="shine inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-alabaster shadow-glow-emerald transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
                Shop Supplements
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-7 py-3.5 text-sm font-semibold text-emerald shadow-float backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/70">
                <Sparkles className="h-4 w-4" />
                Explore Categories
              </button>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                ["180+", "Lab-Tested SKUs"],
                ["40+", "Verified Vendors"],
                ["4.9★", "Avg. Rating"],
              ].map(([stat, label]) => (
                <div
                  key={label}
                  className="glass rounded-2xl px-3 py-3 text-center"
                >
                  <dt className="font-serif text-2xl font-semibold text-emerald">
                    {stat}
                  </dt>
                  <dd className="mt-0.5 text-[11px] text-mist">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 3D visual */}
          <div className="relative">
            <div className="perspective relative">
              <div className="glass-emerald relative aspect-square overflow-hidden rounded-[2rem] shadow-glow-emerald">
                <div className="absolute inset-0 bg-grain opacity-30" />
                <div className="absolute inset-0">
                  <Hero3D />
                </div>
                <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-alabaster backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Lab-tested purity
                </span>
              </div>
            </div>

            {/* Floating trust chip */}
            <div className="animate-float absolute -bottom-4 -left-2 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-float backdrop-blur sm:-left-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald/10 text-emerald">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
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
