import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getVendorContext, getVendorStatement } from "@/lib/vendorData";
import { formatINR, formatDate } from "@/lib/format";
import PrintButton from "@/components/dashboard/PrintButton";

export const dynamic = "force-dynamic";

export default async function StatementPage({
  params,
}: {
  params: { month: string };
}) {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) notFound();

  const statement = await getVendorStatement(ctx.vendorId, params.month);
  if (!statement) notFound();

  const { summary, lines } = statement;
  const v = ctx.vendor;
  const storeName = v?.store_name || v?.company_name || "Vendor";

  return (
    <div className="space-y-5">
      {/* Toolbar (hidden in print) */}
      <div className="no-print flex items-center justify-between">
        <Link
          href="/vendor/dashboard/payouts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to payouts
        </Link>
        <PrintButton />
      </div>

      {/* Printable sheet */}
      <div className="print-sheet mx-auto max-w-3xl rounded-xl2 border border-border bg-white p-8 text-foreground shadow-card">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <img src="/nutraatoz-wordmark.png" alt="Nutraatoz" className="h-8 w-auto" />
            <p className="mt-2 text-xs text-muted-foreground">
              Marketplace settlement statement
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-serif text-lg font-semibold text-primary">
              {summary.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Statement period: {summary.month}
            </p>
          </div>
        </div>

        {/* Vendor + platform details */}
        <div className="mt-5 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Vendor
            </p>
            <p className="mt-1 font-semibold text-foreground">{storeName}</p>
            {v?.gstin && (
              <p className="text-xs text-muted-foreground">GSTIN: {v.gstin}</p>
            )}
            {v?.fssai_license_no && (
              <p className="text-xs text-muted-foreground">
                FSSAI: {v.fssai_license_no}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Marketplace
            </p>
            <p className="mt-1 font-semibold text-foreground">Nutraatoz</p>
            <p className="text-xs text-muted-foreground">
              Commission: 15% of sale value
            </p>
            <p className="text-xs text-muted-foreground">nutraatoz@gmail.com</p>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Gross sales", summary.gross],
            ["Commission (15%)", summary.commission],
            ["Net payout", summary.payout],
          ].map(([label, value], i) => (
            <div
              key={label as string}
              className={`rounded-lg border p-3 ${
                i === 2 ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/40"
              }`}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p
                className={`mt-1 font-serif text-lg font-semibold ${
                  i === 2 ? "text-primary" : "text-foreground"
                }`}
              >
                {formatINR(value as number)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {summary.orderCount} order{summary.orderCount === 1 ? "" : "s"} ·{" "}
          {summary.lineCount} line item{summary.lineCount === 1 ? "" : "s"}
        </p>

        {/* Line items */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2">Date</th>
              <th className="py-2">Order</th>
              <th className="py-2">Product</th>
              <th className="py-2 text-right">Sale</th>
              <th className="py-2 text-right">Commission</th>
              <th className="py-2 text-right">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lines.map((l) => (
              <tr key={l.id}>
                <td className="py-2 text-muted-foreground">{formatDate(l.date)}</td>
                <td className="py-2 font-mono text-xs text-muted-foreground">
                  #{l.orderId.slice(0, 8)}
                </td>
                <td className="py-2 text-foreground">{l.productTitle}</td>
                <td className="py-2 text-right">{formatINR(l.gross)}</td>
                <td className="py-2 text-right text-muted-foreground">
                  {formatINR(l.commission)}
                </td>
                <td className="py-2 text-right font-medium text-primary">
                  {formatINR(l.payout)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-semibold">
              <td className="py-2" colSpan={3}>
                Total
              </td>
              <td className="py-2 text-right">{formatINR(summary.gross)}</td>
              <td className="py-2 text-right text-muted-foreground">
                {formatINR(summary.commission)}
              </td>
              <td className="py-2 text-right text-primary">
                {formatINR(summary.payout)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-6 border-t border-border pt-4 text-[10px] leading-relaxed text-muted-foreground">
          This statement is a summary of marketplace transactions for the period
          shown and is generated for the vendor&apos;s records. Settlement timing
          depends on order capture and payment reconciliation. Not a tax invoice.
        </p>
      </div>
    </div>
  );
}
