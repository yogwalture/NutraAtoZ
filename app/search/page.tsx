import type { Metadata } from "next";
import { FlaskConical, ShieldCheck, SearchX } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getStoreProducts } from "@/lib/publicData";

export const metadata: Metadata = { title: "Search — Nutraatoz" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const all = await getStoreProducts(200);
  const results = q
    ? all.filter((p) =>
        `${p.title} ${p.brand} ${p.description ?? ""} ${p.attributes
          .map((a) => a.value)
          .join(" ")}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-citrus-soft">
          <div className="orb orb-amber right-[-5rem] top-0 h-64 w-64 animate-float opacity-40" />
          <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
            </h1>
            <div className="mt-5">
              <SearchBox defaultValue={q} autoFocus={!q} />
            </div>
            {q && (
              <p className="mt-3 text-sm text-mist">
                {results.length} product{results.length === 1 ? "" : "s"} found
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          {q && results.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-coral/15 bg-white px-6 py-14 text-center shadow-card">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coral/10 text-coral-600">
                <SearchX className="h-6 w-6" />
              </span>
              <p className="mt-3 font-semibold text-ink">No matches found</p>
              <p className="mt-1 text-sm text-mist">
                Try a different term, or{" "}
                <a href="/products" className="font-medium text-coral-600 hover:underline">
                  browse all products
                </a>
                .
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="perspective grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((product, i) => (
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
          ) : (
            <p className="text-center text-sm text-mist">
              Start typing to search our lab-tested catalog.
            </p>
          )}
        </section>
        <Footer />
      </main>
    </div>
  );
}
