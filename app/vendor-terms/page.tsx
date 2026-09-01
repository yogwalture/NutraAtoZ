import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Vendor Commercial Terms — Nutraatoz" };

export default function VendorTermsPage() {
  return (
    <PageShell
      title="Vendor Commercial Terms"
      tagline="Transparent, simple economics. The only confirmed platform fee is a 15% marketplace commission."
    >
      <h2>Marketplace commission</h2>
      <p>
        Nutraatoz charges a <strong>15% marketplace commission</strong> on the
        product selling price. This is the platform&apos;s core fee.
      </p>

      <h2>Other charges</h2>
      <p>
        Onboarding fee, payment-gateway charges, shipping and promotional costs
        depend on your final onboarding agreement and the payment/logistics
        model in effect. Where a charge is zero, it will be stated as zero in
        your agreement. We do not add hidden fees.
      </p>

      <h2>Settlement</h2>
      <p>
        Net proceeds are settled to your registered bank account per the
        settlement timeline in your onboarding agreement. Taxes apply as per law.
      </p>

      <h2>How vendor earnings work (illustration)</h2>
      <p>A simplified example on a ₹1,000 product:</p>
      <div className="not-prose overflow-hidden rounded-2xl border border-coral/15 bg-white">
        {[
          ["Product selling price", "₹1,000"],
          ["NutraAtoZ marketplace commission (15%)", "− ₹150"],
          ["Other applicable charges", "as per agreement"],
          ["Estimated vendor settlement", "≈ ₹850 (before other charges & taxes)"],
        ].map(([label, value], i) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
              i === 3 ? "border-t border-coral/15 bg-coral/5 font-bold text-ink" : "text-mist"
            }`}
          >
            <span>{label}</span>
            <span className={i === 3 ? "text-coral-700" : "text-ink"}>{value}</span>
          </div>
        ))}
      </div>
      <p className="text-xs">
        Illustration only. Actual settlement depends on your final agreement,
        applicable payment/shipping charges and taxes. Figures other than the
        confirmed 15% commission are examples, not commitments.
      </p>

      <p>
        Questions about commercials? Email{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a> or{" "}
        <a href="/vendor/onboarding">start your vendor application</a>.
      </p>
    </PageShell>
  );
}
