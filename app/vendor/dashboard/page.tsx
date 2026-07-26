import {
  IndianRupee,
  Wallet,
  ShoppingCart,
  Package,
  TrendingUp,
} from "lucide-react";
import { getVendorContext, getOverviewStats } from "@/lib/vendorData";
import { formatINR, formatNumber, formatDate } from "@/lib/format";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SetupNotice from "@/components/dashboard/SetupNotice";

export default async function OverviewPage() {
  const ctx = await getVendorContext();
  const stats = ctx.vendorId
    ? await getOverviewStats(ctx.vendorId)
    : {
        revenue: 0,
        payouts: 0,
        commission: 0,
        orderCount: 0,
        productCount: 0,
        activeProductCount: 0,
        series: Array.from({ length: 14 }, () => ({ label: "", value: 0 })),
        recentOrders: [],
      };

  return (
    <div className="space-y-6">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your sales, settlements, and store activity at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Gross revenue"
          value={formatINR(stats.revenue)}
          sub="All-time sales"
          icon={IndianRupee}
        />
        <StatCard
          label="Net payouts"
          value={formatINR(stats.payouts)}
          sub={`After ${formatINR(stats.commission)} commission`}
          icon={Wallet}
          accent="gold"
        />
        <StatCard
          label="Orders"
          value={formatNumber(stats.orderCount)}
          sub="Distinct orders"
          icon={ShoppingCart}
        />
        <StatCard
          label="Products"
          value={formatNumber(stats.productCount)}
          sub={`${stats.activeProductCount} active`}
          icon={Package}
          accent="muted"
        />
      </div>

      <div className="rounded-xl2 border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Payout trend
            </h2>
            <p className="text-xs text-muted-foreground">Last 14 days</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            <TrendingUp className="h-4 w-4" />
            Net settled to you
          </span>
        </div>
        <SalesChart data={stats.series} />
      </div>

      <div className="rounded-xl2 border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Recent orders
          </h2>
          <a
            href="/vendor/dashboard/orders"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </a>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No orders yet. Once customers buy your products, they&apos;ll appear
            here.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {o.product_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{o.order_id.slice(0, 8)} · {formatDate(o.order_created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden text-sm font-medium text-primary sm:block">
                    {formatINR(o.vendor_payout_amount)}
                  </span>
                  <StatusBadge status={o.order_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
