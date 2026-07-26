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

const ICONS: LucideIcon[] = [Shield, Sprout, Moon, Zap, Bone, Sparkles];

export default function CategoriesSection() {
  return (
    <section
      id="categories"
      className="relative overflow-hidden py-14 sm:py-20"
    >
      <div className="orb orb-gold right-[-5rem] top-10 h-56 w-56 animate-float" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              <LayoutGrid className="h-4 w-4" />
              Explore
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-emerald sm:text-4xl">
              Curated Wellness Categories
            </h2>
            <p className="mt-2 max-w-lg text-sm text-mist sm:text-base">
              Hand-picked collections, organized by the goals that matter most
              to you.
            </p>
          </div>
          <a
            href="#categories"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-5 py-2.5 text-sm font-semibold text-emerald shadow-float backdrop-blur transition-colors hover:bg-white/70 sm:inline-flex"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="perspective mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <a
                key={cat.name}
                href="#categories"
                className="tilt shine group flex flex-col justify-between rounded-2xl border border-white/60 bg-white/55 p-5 shadow-float backdrop-blur"
              >
                <div className="tilt-inner">
                  <div className="mb-4 grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-emerald/10 to-gold/10 text-emerald transition-colors group-hover:from-emerald/20">
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-ink">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-mist">{cat.tagline}</p>
                  <p className="mt-3 text-xs font-medium text-emerald">
                    {cat.count} products
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
