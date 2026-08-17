import {
  IndianRupee,
  CircleDollarSign,
  ShoppingCart,
  Store,
  Package,
  ShieldAlert,
} from "lucide-react";
import { getPlatformStats } from "@/lib/adminData";
import { formatINR, formatNumber } from "@/lib/format";
import StatCard from "@/components/dashboard/StatCard";

export default async function AdminOverviewPage() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marketplace-wide performance across every vendor.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Gross merchandise value"
          value={formatINR(stats.gmv)}
          sub="All sales"
          icon={IndianRupee}
        />
        <StatCard
          label="Commission earned"
          value={formatINR(stats.commission)}
          sub="Platform revenue"
          icon={CircleDollarSign}
          accent="gold"
        />
        <StatCard
          label="Orders"
          value={formatNumber(stats.orders)}
          sub="All-time"
          icon={ShoppingCart}
        />
        <StatCard
          label="Vendors"
          value={formatNumber(stats.vendors)}
          sub={`${stats.pendingVendors} pending`}
          icon={Store}
        />
        <StatCard
          label="Pending approvals"
          value={formatNumber(stats.pendingVendors)}
          sub="Awaiting review"
          icon={ShieldAlert}
          accent="gold"
        />
        <StatCard
          label="Products"
          value={formatNumber(stats.products)}
          sub="Listed"
          icon={Package}
          accent="muted"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="/admin/vendors"
          className="group rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Manage vendors
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.pendingVendors} pending approval
              </p>
            </div>
          </div>
        </a>
        <a
          href="/admin/products"
          className="group rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Manage products
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats.products)} listed
              </p>
            </div>
          </div>
        </a>
        <a
          href="/admin/commissions"
          className="group rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
              <CircleDollarSign className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Commission portal
              </p>
              <p className="text-xs text-muted-foreground">
                {formatINR(stats.commission)} earned
              </p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
