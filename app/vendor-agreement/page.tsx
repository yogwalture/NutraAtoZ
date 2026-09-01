import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Vendor Agreement — Nutraatoz" };

export default function VendorAgreementPage() {
  return (
    <PageShell
      title="Vendor Agreement"
      tagline="The terms under which brands and vendors sell on Nutraatoz."
    >
      <p>
        This agreement applies to every manufacturer, brand, distributor,
        wholesaler or importer (&ldquo;Vendor&rdquo;) who lists products on
        Nutraatoz. By submitting a vendor application you agree to these terms.
      </p>

      <h2>1. Eligibility & verification</h2>
      <p>
        Vendors must hold a valid FSSAI licence and provide accurate GSTIN, PAN
        and business details. Nutraatoz verifies these during onboarding and may
        request additional documentation. Listings may be withheld or removed if
        verification lapses or expires.
      </p>

      <h2>2. Product responsibility</h2>
      <p>
        The Vendor is solely responsible for product quality, safety, labelling,
        packaging, statutory compliance and the accuracy of all listing
        information, ingredients and documents (including any Certificate of
        Analysis). Vendors must not publish medical, disease-treatment or
        unsubstantiated claims. Nutraatoz may flag or reject non-compliant
        listings.
      </p>

      <h2>3. Commission & settlement</h2>
      <p>
        Nutraatoz charges a marketplace commission of <strong>15%</strong>.
        Commercial details — charges, settlement timeline and taxes — are set out
        on the <a href="/vendor-terms">Vendor Commercial Terms</a> page.
      </p>

      <h2>4. Fulfilment</h2>
      <p>
        Vendors agree to dispatch confirmed orders within the committed
        timeframe and to handle returns in line with platform policy.
      </p>

      <h2>5. Documents & data</h2>
      <p>
        Vendors authorise Nutraatoz to store and process submitted documents and
        bank/settlement details solely for marketplace operations, in line with
        our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>6. Suspension & termination</h2>
      <p>
        Nutraatoz may suspend or remove a vendor or listing for policy breaches,
        expired documentation, quality complaints or unlawful conduct.
      </p>

      <p>
        Ready to apply? <a href="/vendor/onboarding">Become a vendor</a> or email{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a>.
      </p>

      <p className="text-xs">
        This page is provided for general information and is not legal advice.
        Final vendor contracts should be reviewed by qualified counsel.
      </p>
    </PageShell>
  );
}
