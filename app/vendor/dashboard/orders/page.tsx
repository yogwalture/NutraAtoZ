import { ReceiptText } from "lucide-react";
import { getVendorContext, getVendorOrderItems } from "@/lib/vendorData";
import { formatINR, formatDate } from "@/lib/format";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SetupNotice from "@/components/dashboard/SetupNotice";

export default async function OrdersPage() {
  const ctx = await getVendorContext();
  const items = ctx.vendorId ? await getVendorOrderItems(ctx.vendorId) : [];

  return (
    <div className="space-y-5">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every line item customers have purchased from your store.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <ReceiptText className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-foreground">No orders yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              When customers buy your products, each line item and its payout
              will show here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Sale</th>
                  <th className="px-5 py-3 text-right">Commission</th>
                  <th className="px-5 py-3 text-right">Your payout</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((o) => (
                  <tr key={o.id} className="hover:bg-primary/[0.02]">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      #{o.order_id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {o.product_title}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(o.order_created_at)}
                    </td>
                    <td className="px-5 py-3 text-right text-foreground">
                      {formatINR(o.price)}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      −{formatINR(o.commission_amount)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-primary">
                      {formatINR(o.vendor_payout_amount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={o.order_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
