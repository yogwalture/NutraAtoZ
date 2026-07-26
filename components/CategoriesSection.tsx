import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { categories } from "@/lib/data";

export default function CategoriesSection() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
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
            Hand-picked collections, organized by the goals that matter most to you.
          </p>
        </div>
        <a
          href="#categories"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald/20 px-5 py-2.5 text-sm font-semibold text-emerald transition-colors hover:bg-emerald/5 sm:inline-flex"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href="#categories"
            className="group flex flex-col justify-between rounded-xl2 border border-emerald/10 bg-alabaster p-5 shadow-card transition-all hover:-translate-y-1 hover:border-emerald/20 hover:shadow-card-hover"
          >
            <div className="mb-4 grid aspect-square place-items-center rounded-xl bg-emerald/5 text-emerald/40 transition-colors group-hover:bg-emerald/10">
              <LayoutGrid className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-snug text-ink">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs text-mist">{cat.tagline}</p>
              <p className="mt-3 text-xs font-medium text-emerald">
                {cat.count} products
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
