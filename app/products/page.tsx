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
    <div className="min-h-screen bg-gradient-to-b from-alabaster via-[hsl(48_30%_96%)] to-[hsl(168_24%_95%)]">
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
                    className="tilt group flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-float backdrop-blur"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald/10 via-white/40 to-gold/10">
                      <div className="absolute inset-0 grid place-items-center text-emerald/40 transition-transform duration-500 group-hover:scale-110">
                        <FlaskConical className="h-14 w-14" strokeWidth={1.1} />
                      </div>
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-emerald shadow-float backdrop-blur">
                        <ShieldCheck className="h-3 w-3" />
                        CoA
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-mist">
                        {product.brand}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold leading-snug text-ink">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-mist">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="font-serif text-lg font-semibold text-emerald">
                          ₹{product.price.toLocaleString("en-IN")}
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
