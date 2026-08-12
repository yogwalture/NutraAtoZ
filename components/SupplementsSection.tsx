import { FlaskConical, ShieldCheck, Star } from "lucide-react";
import type { StoreProduct } from "@/lib/publicData";
import { products as placeholderProducts } from "@/lib/data";
import AddToCartButton from "@/components/cart/AddToCartButton";

export default function SupplementsSection({
  products,
}: {
  products: StoreProduct[];
}) {
  const hasLive = products.length > 0;

  return (
    <section id="lab-tested" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald/[0.05] via-transparent to-gold/[0.05]" />
      <div className="orb orb-emerald left-[-6rem] top-1/3 h-72 w-72 animate-pulse-glow" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              <FlaskConical className="h-4 w-4" />
              Verified Quality
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-emerald sm:text-4xl">
              Lab-Tested Premium Supplements
            </h2>
            <p className="mt-2 max-w-lg text-sm text-mist sm:text-base">
              Each product ships with a third-party Certificate of Analysis. No
              proprietary blends, no guesswork.
            </p>
          </div>
          <a
            href="/products"
            className="shine hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Shop all
          </a>
        </div>

        {hasLive ? (
          <div className="perspective mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
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
                  {product.weight_gms ? (
                    <p className="mt-1 text-xs text-mist">{product.weight_gms} g</p>
                  ) : null}

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
        ) : (
          <div className="perspective mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {placeholderProducts.map((product) => (
              <article
                key={product.name}
                className="tilt group flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-float backdrop-blur"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald/10 via-white/40 to-gold/10">
                  <div className="absolute inset-0 grid place-items-center text-emerald/40">
                    <FlaskConical className="h-14 w-14" strokeWidth={1.1} />
                  </div>
                  {product.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 shadow-glow-gold">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-mist">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-ink">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-xs text-mist">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {product.rating} · {product.servings} servings
                  </div>
                  <div className="mt-auto pt-4">
                    <span className="font-serif text-lg font-semibold text-emerald">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
