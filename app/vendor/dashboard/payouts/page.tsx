import Link from "next/link";
import {
  Wallet,
  Clock,
  CircleDollarSign,
  ShieldCheck,
  ShieldAlert,
  FileBadge,
  Landmark,
  CalendarClock,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  getVendorContext,
  getVendorOrderItems,
  getVendorStatements,
} from "@/lib/vendorData";
import { formatINR, formatDate, daysUntil } from "@/lib/format";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SetupNotice from "@/components/dashboard/SetupNotice";
import { Badge } from "@/components/ui/badge";

export default async function PayoutsPage() {
  const ctx = await getVendorContext();
  const items = ctx.vendorId ? await getVendorOrderItems(ctx.vendorId) : [];
  const statements = ctx.vendorId ? await getVendorStatements(ctx.vendorId) : [];

  const settled = items
    .filter((i) => i.order_status?.toUpperCase() === "PAID")
    .reduce((s, i) => s + i.vendor_payout_amount, 0);
  const pending = items
    .filter((i) => i.order_status?.toUpperCase() !== "PAID")
    .reduce((s, i) => s + i.vendor_payout_amount, 0);
  const commission = items.reduce((s, i) => s + i.commission_amount, 0);

  const v = ctx.vendor;
  const fssaiDays = daysUntil(v?.fssai_expiry);
  const fssaiExpired = fssaiDays != null && fssaiDays < 0;
  const fssaiExpiringSoon = fssaiDays != null && fssaiDays >= 0 && fssaiDays <= 30;

  return (
    <div className="space-y-6">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Payouts & compliance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Settlements routed to your linked account, plus your licensing status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Settled to you"
          value={formatINR(settled)}
          sub="Paid orders"
          icon={Wallet}
        />
        <StatCard
          label="Pending settlement"
          value={formatINR(pending)}
          sub="Awaiting capture"
          icon={Clock}
          accent="gold"
        />
        <StatCard
          label="Commission paid"
          value={formatINR(commission)}
          sub="Platform fee"
          icon={CircleDollarSign}
          accent="muted"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Settlement history
              </h2>
              <p className="text-xs text-muted-foreground">
                Each order item routed via Razorpay Route
              </p>
            </div>
            {items.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No settlements yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {items.slice(0, 12).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {o.product_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{o.order_id.slice(0, 8)} ·{" "}
                        {formatDate(o.order_created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-primary">
                        {formatINR(o.vendor_payout_amount)}
                      </span>
                      <StatusBadge status={o.order_status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly statements */}
          <div className="mt-6 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Monthly statements
              </h2>
              <p className="text-xs text-muted-foreground">
                Downloadable settlement statements (PDF) per month
              </p>
            </div>
            {statements.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Statements appear here once you have orders in a month.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {statements.map((s) => (
                  <Link
                    key={s.month}
                    href={`/vendor/dashboard/payouts/statement/${s.month}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-primary/[0.03]"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.orderCount} order{s.orderCount === 1 ? "" : "s"} ·{" "}
                        gross {formatINR(s.gross)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">
                        {formatINR(s.payout)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl2 border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Compliance status
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {v?.is_approved ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Vendor approval</p>
                  <div className="mt-1">
                    {v?.is_approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending review</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileBadge className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">FSSAI license</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {v?.fssai_license_no ?? "—"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Expires {formatDate(v?.fssai_expiry)}
                    </span>
                    {fssaiExpired ? (
                      <Badge variant="danger">Expired</Badge>
                    ) : fssaiExpiringSoon ? (
                      <Badge variant="warning">{fssaiDays}d left</Badge>
                    ) : fssaiDays != null ? (
                      <Badge variant="success">Valid</Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileBadge className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">GSTIN</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {v?.gstin ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Landmark className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Razorpay account
                  </p>
                  <div className="mt-1">
                    {v?.razorpay_linked_id ? (
                      <Badge variant="success">
                        Linked · {v.razorpay_linked_id.slice(0, 12)}…
                      </Badge>
                    ) : (
                      <Badge variant="danger">Not linked</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
