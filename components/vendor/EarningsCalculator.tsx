"use client";

import * as React from "react";
import { Calculator } from "lucide-react";

const COMMISSION_PCT = 15;

function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** Illustrative vendor-earnings calculator. Only the 15% commission is a
 * confirmed figure; everything else is clearly labelled as an estimate. */
export default function EarningsCalculator() {
  const [price, setPrice] = React.useState(999);
  const [units, setUnits] = React.useState(100);

  const p = Number.isFinite(price) && price > 0 ? price : 0;
  const u = Number.isFinite(units) && units > 0 ? units : 0;
  const commissionPerUnit = Math.round((p * COMMISSION_PCT) / 100);
  const settlementPerUnit = Math.max(0, p - commissionPerUnit);
  const monthlyGross = p * u;
  const monthlyCommission = commissionPerUnit * u;
  const monthlySettlement = settlementPerUnit * u;

  return (
    <div className="overflow-hidden rounded-3xl border border-coral/15 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-coral/10 bg-citrus-soft px-6 py-4">
        <Calculator className="h-5 w-5 text-coral-600" />
        <h3 className="font-serif text-lg font-semibold text-ink">
          How vendor earnings work
        </h3>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="calc-price">
              Product selling price (₹)
            </label>
            <input
              id="calc-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="calc-units">
              Units sold per month
            </label>
            <input
              id="calc-units"
              type="number"
              min={0}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
            />
          </div>
          <div className="rounded-xl bg-secondary/50 px-4 py-3 text-xs text-mist">
            Marketplace commission is a flat{" "}
            <strong className="text-ink">{COMMISSION_PCT}%</strong> of the selling
            price. Other charges (payment gateway, shipping, taxes) depend on your
            onboarding agreement.
          </div>
        </div>

        <div className="space-y-3">
          <Row label="Per unit — you receive" value={inr(settlementPerUnit)} sub={`after ${inr(commissionPerUnit)} commission`} />
          <div className="border-t border-coral/10" />
          <Row label="Monthly gross sales" value={inr(monthlyGross)} />
          <Row label="NutraAtoZ commission (15%)" value={"− " + inr(monthlyCommission)} muted />
          <div className="rounded-2xl bg-citrus-gradient px-4 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
              Estimated monthly settlement
            </p>
            <p className="mt-1 font-serif text-2xl font-bold">
              ≈ {inr(monthlySettlement)}
            </p>
            <p className="mt-1 text-[11px] text-white/80">
              Before other applicable charges &amp; taxes
            </p>
          </div>
        </div>
      </div>

      <p className="border-t border-coral/10 px-6 py-3 text-[11px] text-mist">
        Illustration only, not a guarantee of sales or income. Figures other than
        the confirmed 15% commission are examples. See{" "}
        <a href="/vendor-terms" className="font-medium text-coral-600 hover:underline">
          Vendor Commercial Terms
        </a>
        .
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <p className="text-sm text-mist">{label}</p>
        {sub && <p className="text-[11px] text-mist/80">{sub}</p>}
      </div>
      <p className={`font-serif text-lg font-semibold ${muted ? "text-mist" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
