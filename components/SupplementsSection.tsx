import { FlaskConical, Star, ShieldCheck, Plus } from "lucide-react";
import { products } from "@/lib/data";

export default function SupplementsSection() {
  return (
    <section
      id="lab-tested"
      className="border-t border-emerald/10 bg-emerald/[0.03]"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
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
            href="#lab-tested"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-alabaster shadow-card transition-colors hover:bg-emerald-700 sm:inline-flex"
          >
            Shop all
          </a>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.name}
              className="group flex flex-col overflow-hidden rounded-xl2 border border-emerald/10 bg-alabaster shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/3] bg-emerald/5">
                <div className="absolute inset-0 grid place-items-center text-emerald/30">
                  <FlaskConical className="h-12 w-12" strokeWidth={1.25} />
                </div>
                {product.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                    {product.tag}
                  </span>
                )}
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-alabaster/90 px-2 py-1 text-[10px] font-semibold text-emerald shadow-card backdrop-blur">
                  <ShieldCheck className="h-3 w-3" />
                  CoA
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-mist">
                  {product.brand}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-ink">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-xs text-mist">
                  <span className="inline-flex items-center gap-1 font-medium text-ink">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {product.rating}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{product.servings} servings</span>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3">
                  <span className="font-serif text-lg font-semibold text-emerald">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <button
                    aria-label={`Add ${product.name} to cart`}
                    className="grid h-9 w-9 place-items-center rounded-full bg-emerald text-alabaster shadow-card transition-colors hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
