import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FlaskConical,
  ShieldCheck,
  FileText,
  BadgeCheck,
  Store,
  ChevronRight,
  Package,
  Star,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductActions from "@/components/product/ProductActions";
import PincodeCheck from "@/components/product/PincodeCheck";
import ReviewForm from "@/components/product/ReviewForm";
import {
  getStoreProductById,
  getMoreFromVendor,
  type CoaStatus,
} from "@/lib/publicData";
import {
  getProductReviews,
  getReviewSummary,
  getReviewEligibility,
} from "@/lib/reviews";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const p = await getStoreProductById(params.id);
  if (!p) return { title: "Product — Nutraatoz" };
  return {
    title: `${p.title} — ${p.brand} | Nutraatoz`,
    description:
      p.description ??
      `${p.title} by ${p.brand}, available on Nutraatoz — FSSAI-verified vendor.`,
  };
}

function coaLabel(status: CoaStatus): { label: string; tone: string } {
  switch (status) {
    case "INDEPENDENTLY_TESTED":
      return { label: "Independently tested by NutraAtoZ", tone: "text-emerald-700 bg-emerald-50" };
    case "NUTRAATOZ_REVIEWED":
      return { label: "CoA reviewed by NutraAtoZ", tone: "text-coral-700 bg-coral/10" };
    case "VENDOR_PROVIDED":
      return { label: "Vendor-provided Certificate of Analysis", tone: "text-berry bg-berry/10" };
    default:
      return { label: "Certificate of Analysis available on request", tone: "text-mist bg-secondary" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const p = await getStoreProductById(params.id);
  if (!p) notFound();

  const [related, reviews, summary, eligibility] = await Promise.all([
    getMoreFromVendor(p.vendorId, p.id, 4),
    getProductReviews(p.id),
    getReviewSummary(p.id),
    getReviewEligibility(p.id),
  ]);
  const coa = coaLabel(p.coaStatus);
  const inStock = p.stock === null || p.stock > 0;

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-mist">
            <a href="/" className="hover:text-coral-600">Home</a>
            <ChevronRight className="h-3 w-3" />
            <a href="/products" className="hover:text-coral-600">Shop</a>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-ink">{p.title}</span>
          </nav>

          {/* Top: image + buy box */}
          <div className="mt-5 grid gap-8 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25">
              <div className="absolute inset-0 grid place-items-center text-coral-600">
                <FlaskConical className="h-28 w-28" strokeWidth={1} />
              </div>
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-coral-600 shadow-float backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified vendor
              </span>
              {p.discount && (
                <span className="absolute left-4 top-4 rounded-full bg-citrus-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-glow-berry">
                  {p.discount}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-berry">
                {p.brand}
              </p>
              <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {p.title}
              </h1>

              {summary.count > 0 && (
                <a
                  href="#reviews"
                  className="mt-2 inline-flex items-center gap-2 text-sm text-mist hover:text-coral-600"
                >
                  <Stars value={Math.round(summary.average)} />
                  <span className="font-medium">{summary.average.toFixed(1)}</span>
                  <span>
                    ({summary.count} review{summary.count === 1 ? "" : "s"})
                  </span>
                </a>
              )}

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-ink">
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
                {p.discount && (
                  <span className="text-lg text-mist line-through">
                    ₹{p.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {p.discount && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
                    {p.discount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-mist">Inclusive of all taxes</p>

              <p className={`mt-3 text-sm font-medium ${inStock ? "text-emerald-700" : "text-destructive"}`}>
                {inStock ? "In stock" : "Out of stock"}
              </p>

              <div className="mt-5">
                <ProductActions
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  brand={p.brand}
                  inStock={inStock}
                />
              </div>

              {/* trust chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {["FSSAI-verified vendor", "Documented ingredients", "Secure Cash on Delivery"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-mist shadow-card">
                    <BadgeCheck className="h-3.5 w-3.5 text-coral-600" />
                    {t}
                  </span>
                ))}
              </div>

              {/* delivery */}
              <div className="mt-6 rounded-2xl border border-coral/15 bg-white p-4 shadow-card">
                <p className="mb-2 text-sm font-bold text-ink">Delivery</p>
                <PincodeCheck />
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {p.description && (
                <Section title="Why this product">
                  <p className="text-sm leading-relaxed text-mist">{p.description}</p>
                </Section>
              )}

              {p.ingredients && (
                <Section title="Key ingredients">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-mist">
                    {p.ingredients}
                  </p>
                </Section>
              )}

              <Section title="Product information">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {p.weight_gms ? <Spec label="Net quantity" value={`${p.weight_gms} g`} /> : null}
                  {p.attributes.map((a) => (
                    <Spec key={a.label} label={a.label} value={a.value} />
                  ))}
                  <Spec label="Marketed by" value={p.brand} />
                  <Spec label="Country of origin" value="India" />
                </dl>
              </Section>

              {/* Quality & documents */}
              <Section title="Quality &amp; documents">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-coral-600" />
                    <div>
                      <p className="text-sm font-semibold text-ink">Verified vendor</p>
                      <p className="text-xs text-mist">
                        Sold by an FSSAI-verified vendor reviewed during onboarding.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-coral-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">Certificate of Analysis</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${coa.tone}`}>
                        {coa.label}
                      </span>
                      {(p.coaLab || p.coaBatch || p.coaDate) && (
                        <p className="mt-1.5 text-xs text-mist">
                          {[
                            p.coaLab ? `Lab: ${p.coaLab}` : null,
                            p.coaBatch ? `Batch: ${p.coaBatch}` : null,
                            p.coaDate ? `Report: ${p.coaDate}` : null,
                          ].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {p.coaUrl && (
                        <a
                          href={p.coaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-coral/20 bg-white px-3 py-1.5 text-xs font-semibold text-coral-700 hover:bg-coral/5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View CoA
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Section>

              {/* Reviews (verified purchase only) */}
              <Section title="Customer reviews" id="reviews">
                {summary.count > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-4xl font-bold text-ink">
                        {summary.average.toFixed(1)}
                      </span>
                      <div>
                        <Stars value={Math.round(summary.average)} />
                        <p className="mt-0.5 text-xs text-mist">
                          {summary.count} verified review
                          {summary.count === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-[180px] flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((n) => {
                        const c = summary.distribution[n] ?? 0;
                        const pct = summary.count
                          ? Math.round((c / summary.count) * 100)
                          : 0;
                        return (
                          <div key={n} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-mist">{n}</span>
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                              <span
                                className="block h-full rounded-full bg-accent"
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="w-6 text-right text-mist">{c}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-mist">
                    <Star className="h-4 w-4 text-mist/50" />
                    No verified reviews yet. Only verified purchasers can review —
                    be the first after your order.
                  </p>
                )}

                {/* Individual reviews */}
                {reviews.length > 0 && (
                  <ul className="mt-6 space-y-5 border-t border-coral/10 pt-5">
                    {reviews.map((r) => (
                      <li key={r.id}>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} />
                          {r.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              <BadgeCheck className="h-3 w-3" />
                              Verified purchase
                            </span>
                          )}
                        </div>
                        {r.title && (
                          <p className="mt-1.5 text-sm font-bold text-ink">
                            {r.title}
                          </p>
                        )}
                        {r.body && (
                          <p className="mt-1 text-sm leading-relaxed text-mist">
                            {r.body}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-mist">
                          {r.reviewerName} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Write-a-review affordance */}
                <div className="mt-6 border-t border-coral/10 pt-5">
                  {eligibility.canReview ? (
                    <ReviewForm
                      productId={p.id}
                      alreadyReviewed={eligibility.alreadyReviewed}
                    />
                  ) : eligibility.signedIn ? (
                    <p className="text-sm text-mist">
                      Only verified purchasers can review this product. Once your
                      order is placed, you can share your experience here.
                    </p>
                  ) : (
                    <p className="text-sm text-mist">
                      <a href="/login" className="font-semibold text-coral-600 hover:underline">
                        Sign in
                      </a>{" "}
                      to write a review. Reviews are limited to verified
                      purchasers.
                    </p>
                  )}
                </div>
              </Section>
            </div>

            {/* Vendor card */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-coral/15 bg-white p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-citrus-gradient text-white">
                    <Store className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-ink">{p.brand}</p>
                    <p className="inline-flex items-center gap-1 text-xs font-medium text-coral-600">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified vendor
                    </p>
                  </div>
                </div>
                <a
                  href={`/search?q=${encodeURIComponent(p.brand)}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-coral/25 px-4 py-2.5 text-sm font-bold text-coral-700 transition-colors hover:bg-coral/5"
                >
                  View store
                </a>
              </div>
            </aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="font-serif text-2xl font-semibold text-ink">You may also like</h2>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((r) => (
                  <article key={r.id} className="group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card">
                    <a href={`/product/${r.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25 text-coral-600">
                      <span className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
                        <FlaskConical className="h-14 w-14" strokeWidth={1.1} />
                      </span>
                    </a>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-berry">{r.brand}</p>
                      <a href={`/product/${r.id}`} className="mt-1 text-sm font-bold leading-snug text-ink hover:text-coral-700">
                        {r.title}
                      </a>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="font-serif text-lg font-semibold text-ink">
                          ₹{r.price.toLocaleString("en-IN")}
                        </span>
                        <AddToCartButton id={r.id} title={r.title} price={r.price} brand={r.brand} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <p className="mt-12 flex items-start gap-2 rounded-2xl bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-mist">
            <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This is a nutraceutical / dietary supplement and is not intended to
            diagnose, treat, cure or prevent any disease. Product information is
            provided by the vendor. Consult a qualified healthcare professional
            before use.
          </p>
        </div>
        <Footer />
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 rounded-2xl border border-coral/15 bg-white p-5 shadow-card">
      <h2 className="font-serif text-lg font-semibold text-ink" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= value ? "fill-accent text-accent" : "text-mist/30"}`}
        />
      ))}
    </span>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-coral/10 py-1.5 text-sm">
      <dt className="text-mist">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
