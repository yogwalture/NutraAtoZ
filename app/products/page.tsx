import type { Metadata } from "next";
import { FlaskConical, ShieldCheck } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getStoreProducts } from "@/lib/publicData";

export const metadata: Metadata = {
  title: "Shop Supplements — Nutraatoz",
};

export const revalidate = 30;

export default async function ProductsPage() {
  const products = await getStoreProducts(60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)]">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden">
          <div className="orb orb-emerald left-[-6rem] top-0 h-72 w-72 animate-float-slow" />
          <div className="orb orb-gold right-[-5rem] top-24 h-64 w-64 animate-float" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                <FlaskConical className="h-4 w-4" />
                All products
              </span>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-emerald">
                Lab-Tested Supplements
              </h1>
              <p className="mt-2 text-sm text-mist sm:text-base">
                Every product from FSSAI-verified vendors, with a Certificate of
                Analysis on request.
              </p>
            </div>

            {products.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
                <p className="text-sm text-muted-foreground">
                  No products are live yet. Check back soon.
                </p>
              </div>
            ) : (
              <div className="perspective mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="tilt group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25 text-coral-600">
                      <div className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
                        <FlaskConical className="h-16 w-16" strokeWidth={1.1} />
                      </div>
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-coral-600 shadow-float backdrop-blur">
                        <ShieldCheck className="h-3 w-3" />
                        CoA
                      </span>
                      {product.discount && (
                        <span className="absolute left-3 top-3 rounded-full bg-citrus-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow-berry">
                          {product.discount}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-berry">
                        {product.brand}
                      </p>
                      <h3 className="mt-1 text-sm font-bold leading-snug text-ink">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-mist">
                          {product.description}
                        </p>
                      )}
                      {product.attributes && product.attributes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.attributes.slice(0, 4).map((a) => (
                            <span
                              key={a.label}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-coral-700"
                            >
                              {a.label}: {a.value}
                            </span>
                          ))}
                        </div>
                      )}
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
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
