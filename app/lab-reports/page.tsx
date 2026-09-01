import type { Metadata } from "next";
import { FlaskConical, ShieldCheck } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Lab Reports — Nutraatoz" };

export default function LabReportsPage() {
  return (
    <PageShell
      title="Lab reports & documentation"
      tagline="Transparent product documentation from FSSAI-verified vendors — with a clear label for what has been verified."
    >
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3.5 py-1.5 text-sm font-semibold text-coral-600">
          <FlaskConical className="h-4 w-4" />
          Certificate of Analysis
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-berry/10 px-3.5 py-1.5 text-sm font-semibold text-berry">
          <ShieldCheck className="h-4 w-4" />
          FSSAI-verified vendors
        </span>
      </div>

      <h2>What is a Certificate of Analysis (CoA)?</h2>
      <p>
        A CoA is a document from an accredited, independent laboratory that
        verifies a product&apos;s identity, potency, and purity — confirming what&apos;s
        on the label is actually in the bottle, and screening for contaminants
        like heavy metals and microbes.
      </p>

      <h2>Our standard</h2>
      <p>
        Vendors are required to provide accurate product documentation, and a
        Certificate of Analysis is available on request for eligible products.
        Every vendor holds an active <strong>FSSAI licence</strong>, and we
        re-check licences and expiry dates so lapsed vendors are removed from the
        storefront.
      </p>

      <h2>How to get a report</h2>
      <p>
        Want the CoA for a specific product or batch? Email{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a> with the
        product name and batch number and we&apos;ll share the report.
      </p>
    </PageShell>
  );
}
