import { FlaskConical, ShieldCheck, ArrowRight } from "lucide-react";
import type { StoreProduct } from "@/lib/publicData";
import { products as placeholderProducts } from "@/lib/data";
import AddToCartButton from "@/components/cart/AddToCartButton";
import RevealOnScroll from "./RevealOnScroll";

// Rotating vibrant image-panel gradients.
const PANELS = [
  "from-coral-500/25 via-white to-berry-500/25 text-coral-600",
  "from-amber-500/25 via-white to-coral-500/25 text-amber-600",
  "from-berry-500/25 via-white to-amber-500/25 text-berry-600",
  "from-coral-500/25 via-white to-amber-500/25 text-coral-600",
];

export default function SupplementsSection({
  products,
}: {
  products: StoreProduct[];
}) {
  const hasLive = products.length > 0;

  return (
    <section id="lab-tested" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-citrus-soft" />
      <div className="orb orb-coral left-[-6rem] top-1/3 h-72 w-72 animate-pulse-glow opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <RevealOnScroll className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-coral-600">
              <FlaskConical className="h-4 w-4" />
              Verified Quality
            </span>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              <span className="text-gradient">Premium</span> Supplements,
              Verified Vendors
            </h2>
            <p className="mt-3 max-w-lg text-sm text-mist sm:text-base">
              From FSSAI-verified vendors, with transparent ingredient
              information and a Certificate of Analysis available on request.
            </p>
          </div>
          <a
            href="/products"
            className="shine inline-flex shrink-0 items-center gap-1.5 rounded-full bg-citrus-gradient px-6 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
          >
            Shop all
            <ArrowRight className="h-4 w-4" />
          </a>
        </RevealOnScroll>

        <div className="perspective mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hasLive
            ? products.slice(0, 8).map((product, i) => (
                <RevealOnScroll key={product.id} delay={(i % 4) * 80}>
                  <article className="tilt group flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card">
                    <div
                      className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${PANELS[i % PANELS.length]}`}
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
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-berry">
                        {product.brand}
                      </p>
                      <h3 className="mt-1 text-sm font-bold leading-snug text-ink">
                        {product.title}
                      </h3>
                      {product.attributes && product.attributes.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {product.attributes.slice(0, 3).map((a) => (
                            <span
                              key={a.label}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-coral-700"
                            >
                              {a.value}
                            </span>
                          ))}
                        </div>
                      ) : product.weight_gms ? (
                        <p className="mt-1 text-xs text-mist">
                          {product.weight_gms} g
                        </p>
                      ) : null}

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
                </RevealOnScroll>
              ))
            : placeholderProducts.map((product, i) => (
                <RevealOnScroll key={product.name} delay={(i % 4) * 80}>
                  <article className="tilt group flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card">
                    <div
                      className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${PANELS[i % PANELS.length]}`}
                    >
                      <div className="absolute inset-0 grid place-items-center">
                        <FlaskConical className="h-16 w-16" strokeWidth={1.1} />
                      </div>
                      {product.tag && (
                        <span className="absolute left-3 top-3 rounded-full bg-citrus-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow-berry">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-berry">
                        {product.brand}
                      </p>
                      <h3 className="mt-1 text-sm font-bold leading-snug text-ink">
                        {product.name}
                      </h3>
                      <div className="mt-2 text-xs text-mist">
                        {product.servings} servings
                      </div>
                      <div className="mt-auto pt-4">
                        <span className="font-serif text-lg font-semibold text-ink">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
        </div>
      </div>
    </section>
  );
}
