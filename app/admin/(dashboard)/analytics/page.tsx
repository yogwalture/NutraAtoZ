import { BarChart3, Eye, ShoppingCart, CreditCard, Package, Sparkles, Target } from "lucide-react";
import { getAnalyticsSummary } from "@/lib/adminData";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const a = await getAnalyticsSummary(30);
  const top = a.funnel[0]?.count || 0;

  const cards = [
    { label: "Product views", value: a.totals["product_view"] ?? 0, icon: Eye },
    { label: "Add to cart", value: a.totals["add_to_cart"] ?? 0, icon: ShoppingCart },
    { label: "Purchases", value: a.totals["purchase"] ?? 0, icon: CreditCard },
    { label: "Finder completes", value: a.totals["finder_complete"] ?? 0, icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          First-party funnel over the last {a.days} days · {a.eventCount} events
          recorded. No personal data is collected.
        </p>
      </div>

      {a.eventCount === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <BarChart3 className="h-6 w-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            No events yet. Traffic and funnel activity will appear here as
            customers browse the store.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-float backdrop-blur"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-serif text-2xl font-semibold text-foreground">
                    {c.value.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Funnel */}
            <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur">
              <h2 className="font-serif text-lg font-semibold text-primary">
                Conversion funnel
              </h2>
              <div className="mt-4 space-y-3">
                {a.funnel.map((s) => {
                  const pct = top > 0 ? Math.round((s.count / top) * 100) : 0;
                  return (
                    <div key={s.event}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{s.label}</span>
                        <span className="text-muted-foreground">
                          {s.count.toLocaleString("en-IN")}
                          {top > 0 && s.event !== "product_view" && (
                            <span className="ml-1 text-xs">({pct}%)</span>
                          )}
                        </span>
                      </div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Recorded purchase value (last {a.days}d):{" "}
                <span className="font-semibold text-foreground">
                  {formatINR(a.purchaseValue)}
                </span>
              </p>
            </div>

            {/* Top products */}
            <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur">
              <h2 className="font-serif text-lg font-semibold text-primary">
                Most-viewed products
              </h2>
              {a.topProducts.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No product views yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {a.topProducts.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/5 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="flex items-center gap-2 truncate text-sm text-foreground">
                        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{p.title}</span>
                      </span>
                      <span className="ml-auto text-sm font-semibold text-muted-foreground">
                        {p.views}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Goal-page views: {a.totals["goal_view"] ?? 0}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
