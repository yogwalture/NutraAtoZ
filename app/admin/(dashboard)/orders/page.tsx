import { ReceiptText } from "lucide-react";
import { getAllOrderItems } from "@/lib/adminData";
import { formatINR, formatDate } from "@/lib/format";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default async function AdminOrdersPage() {
  const items = await getAllOrderItems();
  const gmv = items.reduce((s, i) => s + i.price, 0);
  const commission = items.reduce((s, i) => s + i.commission_amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Orders &amp; payouts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every order line across the marketplace — sale, commission, and vendor
          settlement.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-float backdrop-blur">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <ReceiptText className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Sale</th>
                  <th className="px-5 py-3 text-right">Commission</th>
                  <th className="px-5 py-3 text-right">Vendor payout</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {items.map((o) => (
                  <tr key={o.id} className="hover:bg-primary/[0.02]">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      #{o.order_id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {o.product_title}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {o.vendor_name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right text-foreground">
                      {formatINR(o.price)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-accent-foreground">
                      {formatINR(o.commission_amount)}
                    </td>
                    <td className="px-5 py-3 text-right text-primary">
                      {formatINR(o.vendor_payout_amount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/50 text-sm font-semibold">
                  <td className="px-5 py-3 text-muted-foreground" colSpan={4}>
                    Totals
                  </td>
                  <td className="px-5 py-3 text-right text-foreground">
                    {formatINR(gmv)}
                  </td>
                  <td className="px-5 py-3 text-right text-primary">
                    {formatINR(commission)}
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {formatINR(gmv - commission)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
