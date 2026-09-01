import {
  ArrowUpRight,
  LayoutGrid,
  Shield,
  Sprout,
  Moon,
  Zap,
  Bone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { categories } from "@/lib/data";
import RevealOnScroll from "./RevealOnScroll";

const ICONS: LucideIcon[] = [Shield, Sprout, Moon, Zap, Bone, Sparkles];

// Rotating vibrant tile themes.
const THEMES = [
  { tile: "bg-gradient-to-br from-coral-500 to-berry-500", ring: "group-hover:ring-coral/30" },
  { tile: "bg-gradient-to-br from-amber-500 to-coral-500", ring: "group-hover:ring-amber/30" },
  { tile: "bg-gradient-to-br from-berry-500 to-plum", ring: "group-hover:ring-berry/30" },
  { tile: "bg-gradient-to-br from-coral-500 to-amber-500", ring: "group-hover:ring-coral/30" },
  { tile: "bg-gradient-to-br from-berry-500 to-coral-500", ring: "group-hover:ring-berry/30" },
  { tile: "bg-gradient-to-br from-amber-500 to-berry-500", ring: "group-hover:ring-amber/30" },
];

export default function CategoriesSection() {
  return (
    <section id="categories" className="relative overflow-hidden py-16 sm:py-24">
      <div className="orb orb-amber right-[-5rem] top-10 h-56 w-56 animate-float opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <RevealOnScroll className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-berry/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-berry">
              <LayoutGrid className="h-4 w-4" />
              Explore
            </span>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              Curated Wellness{" "}
              <span className="text-gradient">Categories</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-mist sm:text-base">
              Hand-picked collections, organized by the goals that matter most
              to you.
            </p>
          </div>
          <a
            href="/products"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-coral/25 bg-white/70 px-5 py-2.5 text-sm font-bold text-coral-700 shadow-float backdrop-blur transition-colors hover:bg-white"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </RevealOnScroll>

        <div className="perspective mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => {
            const Icon = ICONS[i % ICONS.length];
            const theme = THEMES[i % THEMES.length];
            return (
              <RevealOnScroll key={cat.name} delay={i * 70}>
                <a
                  href="/products"
                  className={`tilt group flex h-full flex-col justify-between rounded-3xl border border-white/70 bg-white p-5 shadow-card ring-2 ring-transparent transition-all ${theme.ring}`}
                >
                  <div className="tilt-inner">
                    <div
                      className={`mb-4 grid aspect-square place-items-center rounded-2xl text-white shadow-glow-coral transition-transform duration-300 group-hover:scale-105 ${theme.tile}`}
                    >
                      <Icon className="h-8 w-8" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-sm font-bold leading-snug text-ink">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-mist">{cat.tagline}</p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-coral-600">
                      Explore
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </a>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
