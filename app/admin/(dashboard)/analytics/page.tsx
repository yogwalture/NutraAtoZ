import {
  BarChart3,
  Eye,
  ShoppingCart,
  CreditCard,
  Package,
  Sparkles,
  Target,
  HeartPulse,
  Activity,
  Pill,
} from "lucide-react";
import { getAnalyticsSummary, getWellnessInsights } from "@/lib/adminData";
import { getGoal } from "@/lib/goals";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [a, w] = await Promise.all([
    getAnalyticsSummary(30),
    getWellnessInsights(30),
  ]);
  const top = a.funnel[0]?.count || 0;

  const scanStarts = a.totals["wellness_scan_start"] ?? 0;
  const scanCompletes = a.totals["wellness_scan_complete"] ?? 0;
  const scanRate =
    scanStarts > 0 ? Math.round((scanCompletes / scanStarts) * 100) : 0;
  const maxGoal = w.topGoals[0]?.count || 0;
  const maxNutrient = w.topNutrients[0]?.count || 0;

  const cards = [
    { label: "Product views", value: a.totals["product_view"] ?? 0, icon: Eye },
    { label: "Add to cart", value: a.totals["add_to_cart"] ?? 0, icon: ShoppingCart },
    { label: "Purchases", value: a.totals["purchase"] ?? 0, icon: CreditCard },
    { label: "Finder completes", value: a.totals["finder_complete"] ?? 0, icon: Sparkles },
    { label: "Scans started", value: scanStarts, icon: Activity },
    { label: "Scans completed", value: scanCompletes, icon: HeartPulse },
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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

          {/* Wellness Scan */}
          <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
                <HeartPulse className="h-5 w-5" />
                Wellness Scan
              </h2>
              <span className="text-xs text-muted-foreground">
                {w.scans.toLocaleString("en-IN")} completed · last {w.days}d
              </span>
            </div>

            {/* Start → complete funnel */}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Started</span>
                  <span className="text-muted-foreground">
                    {scanStarts.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-full rounded-full bg-primary/50" />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Completed</span>
                  <span className="text-muted-foreground">
                    {scanCompletes.toLocaleString("en-IN")}
                    {scanStarts > 0 && (
                      <span className="ml-1 text-xs">({scanRate}%)</span>
                    )}
                  </span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${scanRate}%` }}
                  />
                </div>
                {w.bmiBreakdown.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-foreground">
                      BMI distribution
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {w.bmiBreakdown.map((b) => (
                        <div
                          key={b.category}
                          className="flex items-center justify-between text-xs text-muted-foreground"
                        >
                          <span>{b.category}</span>
                          <span className="font-semibold text-foreground">
                            {b.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Top recommended goals */}
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Most-recommended goals
                </p>
                {w.topGoals.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No scans yet.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {w.topGoals.map((g) => {
                      const pct = maxGoal > 0 ? (g.count / maxGoal) * 100 : 0;
                      return (
                        <li key={g.slug}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate text-foreground">
                              {getGoal(g.slug)?.label ?? g.slug}
                            </span>
                            <span className="ml-2 shrink-0 text-xs font-semibold text-muted-foreground">
                              {g.count}
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Top recommended nutrients */}
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Pill className="h-3.5 w-3.5" />
                  Most-recommended nutrients
                </p>
                {w.topNutrients.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No scans yet.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {w.topNutrients.map((n) => {
                      const pct =
                        maxNutrient > 0 ? (n.count / maxNutrient) * 100 : 0;
                      return (
                        <li key={n.name}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate text-foreground">
                              {n.name}
                            </span>
                            <span className="ml-2 shrink-0 text-xs font-semibold text-muted-foreground">
                              {n.count}
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
