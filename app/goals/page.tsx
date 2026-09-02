import type { Metadata } from "next";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Target, ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { GOALS } from "@/lib/goals";
import { getGoalCounts } from "@/lib/publicData";

export const metadata: Metadata = {
  title: "Shop by Goal — Nutraatoz",
  description:
    "Find nutraceuticals by what you want to support — sleep, energy, immunity, gut health and more. From FSSAI-verified vendors.",
};

export const revalidate = 60;

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export default async function GoalsIndexPage() {
  const counts = await getGoalCounts();

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-citrus-soft">
          <div className="orb orb-berry left-[-5rem] top-0 h-64 w-64 animate-float opacity-40" />
          <div className="relative z-10 mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-coral-600">
              <Target className="h-4 w-4" />
              Shop by goal
            </span>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              What would you like to <span className="text-gradient">support?</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-mist sm:text-base">
              Browse verified nutraceuticals by everyday wellness goal. Pick a
              focus and we&apos;ll show matching products from FSSAI-verified
              vendors.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GOALS.map((goal) => {
              const Icon = ((Icons as unknown as Record<string, IconType>)[
                goal.icon
              ] ?? Target) as IconType;
              const count = counts[goal.slug] ?? 0;
              return (
                <Link
                  key={goal.slug}
                  href={`/goals/${goal.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white p-6 shadow-card transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-60 ${goal.gradient}`}
                  />
                  <div className="relative z-10 flex flex-1 flex-col">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-coral-600 shadow-float">
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                    </span>
                    <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
                      {goal.label}
                    </h2>
                    <p className="mt-1 text-sm text-mist">{goal.blurb}</p>
                    <div className="mt-auto flex items-center justify-between pt-5">
                      <span className="text-xs font-semibold text-coral-700">
                        {count} product{count === 1 ? "" : "s"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-coral-600 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="mt-10 rounded-2xl bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-mist">
            Wellness goals describe everyday nutritional support only. Products
            are nutraceuticals / dietary supplements and are not intended to
            diagnose, treat, cure or prevent any disease. Consult a qualified
            healthcare professional before use.
          </p>
        </section>
        <Footer />
      </main>
    </div>
  );
}
