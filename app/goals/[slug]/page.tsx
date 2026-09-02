import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import { FlaskConical, ShieldCheck, ChevronRight, Target } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { GOALS, getGoal } from "@/lib/goals";
import { getProductsByGoal } from "@/lib/publicData";

export const revalidate = 60;

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export function generateStaticParams() {
  return GOALS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const goal = getGoal(params.slug);
  if (!goal) return { title: "Shop by Goal — Nutraatoz" };
  return {
    title: `${goal.label} Supplements — Nutraatoz`,
    description: `${goal.blurb} Verified nutraceuticals for ${goal.label.toLowerCase()} from FSSAI-verified vendors.`,
  };
}

export default async function GoalPage({
  params,
}: {
  params: { slug: string };
}) {
  const goal = getGoal(params.slug);
  if (!goal) notFound();

  const products = await getProductsByGoal(params.slug);
  const Icon = ((Icons as unknown as Record<string, IconType>)[goal.icon] ??
    Target) as IconType;

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className={`relative overflow-hidden bg-gradient-to-br ${goal.gradient}`}>
          <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <nav className="flex items-center gap-1.5 text-xs text-mist">
              <Link href="/" className="hover:text-coral-600">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/goals" className="hover:text-coral-600">Shop by Goal</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink">{goal.label}</span>
            </nav>
            <div className="mt-5 flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-coral-600 shadow-float">
                <Icon className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {goal.label}
                </h1>
                <p className="mt-1 max-w-xl text-sm text-mist sm:text-base">
                  {goal.blurb}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <p className="mb-6 text-sm text-mist">
            {products.length} verified product{products.length === 1 ? "" : "s"}
          </p>

          {products.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-coral/15 bg-white px-6 py-14 text-center shadow-card">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coral/10 text-coral-600">
                <Target className="h-6 w-6" />
              </span>
              <p className="mt-3 font-semibold text-ink">No products here yet</p>
              <p className="mt-1 text-sm text-mist">
                We&apos;re onboarding vendors in this area. Meanwhile,{" "}
                <Link href="/products" className="font-medium text-coral-600 hover:underline">
                  browse all products
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="perspective grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="tilt group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25 text-coral-600"
                  >
                    <div className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
                      <FlaskConical className="h-16 w-16" strokeWidth={1.1} />
                    </div>
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-coral-600 shadow-float backdrop-blur">
                      <ShieldCheck className="h-3 w-3" />
                      Verified vendor
                    </span>
                    {product.discount && (
                      <span className="absolute left-3 top-3 rounded-full bg-citrus-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow-berry">
                        {product.discount}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-berry">
                      {product.brand}
                    </p>
                    <Link
                      href={`/product/${product.id}`}
                      className="mt-1 text-sm font-bold leading-snug text-ink transition-colors hover:text-coral-700"
                    >
                      {product.title}
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-serif text-lg font-semibold text-ink">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.discount && (
                          <span className="text-xs text-mist line-through">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </span>
                      <AddToCartButton
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        brand={product.brand}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Other goals */}
          <div className="mt-14">
            <h2 className="font-serif text-xl font-semibold text-ink">Other goals</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {GOALS.filter((g) => g.slug !== goal.slug).map((g) => (
                <Link
                  key={g.slug}
                  href={`/goals/${g.slug}`}
                  className="rounded-full border border-coral/20 bg-white px-4 py-2 text-sm font-medium text-coral-700 shadow-card transition-colors hover:bg-coral/5"
                >
                  {g.label}
                </Link>
              ))}
            </div>
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
