import {
  Eye,
  ShoppingCart,
  ReceiptText,
  IndianRupee,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { getVendorContext, getVendorInsights } from "@/lib/vendorData";
import { formatINR } from "@/lib/format";
import SetupNotice from "@/components/dashboard/SetupNotice";

export const dynamic = "force-dynamic";

export default async function VendorInsightsPage() {
  const ctx = await getVendorContext();
  const insights = ctx.vendorId ? await getVendorInsights(ctx.vendorId, 30) : null;

  const funnel = insights
    ? [
        { label: "Product views", value: insights.views, icon: Eye },
        { label: "Added to cart", value: insights.addToCart, icon: ShoppingCart },
        { label: "Ordered", value: insights.orderLines, icon: ReceiptText },
      ]
    : [];
  const funnelTop = funnel[0]?.value || 0;

  return (
    <div className="space-y-6">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How your products are performing over the last {insights?.days ?? 30}{" "}
          days. Views and cart activity are anonymous, aggregate counts.
        </p>
      </div>

      {!insights || (insights.views === 0 && insights.orderLines === 0) ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-foreground">No activity yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            As customers view and buy your products, your funnel and top
            performers will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Revenue (30d)", value: formatINR(insights.revenue), icon: IndianRupee },
              { label: "Your payout (30d)", value: formatINR(insights.payouts), icon: IndianRupee },
              { label: "Orders (30d)", value: String(insights.orderLines), icon: ReceiptText },
              { label: "View → order", value: `${insights.conversionPct}%`, icon: TrendingUp },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-serif text-2xl font-semibold text-foreground">
                    {c.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Funnel */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-serif text-lg font-semibold text-primary">
                Your funnel
              </h2>
              <div className="mt-4 space-y-3">
                {funnel.map((s) => {
                  const pct = funnelTop > 0 ? Math.round((s.value / funnelTop) * 100) : 0;
                  const Icon = s.icon;
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {s.label}
                        </span>
                        <span className="text-muted-foreground">
                          {s.value.toLocaleString("en-IN")}
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
            </div>

            {/* Top products */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-serif text-lg font-semibold text-primary">
                Top products
              </h2>
              {insights.topProducts.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No views yet.</p>
              ) : (
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2">Product</th>
                      <th className="pb-2 text-right">Views</th>
                      <th className="pb-2 text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {insights.topProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 pr-2 font-medium text-foreground">
                          <span className="line-clamp-1">{p.title}</span>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{p.views}</td>
                        <td className="py-2 text-right text-muted-foreground">{p.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Low stock */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Low stock
            </h2>
            {insights.lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing running low — all products are above{" "}
                {5} units.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {insights.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-foreground">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {p.title}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.stock === 0
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
