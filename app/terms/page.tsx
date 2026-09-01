import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Terms of Service — Nutraatoz" };

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      tagline="The terms that govern your use of the Nutraatoz marketplace."
    >
      <p>
        Nutraatoz operates an online marketplace that connects consumers with
        independent, FSSAI-verified nutraceutical vendors across India. By using
        the platform you agree to these terms. Please read them carefully.
      </p>

      <h2>1. Marketplace role</h2>
      <p>
        Nutraatoz is a marketplace facilitator. Products are sold by independent
        vendors who are solely responsible for their listings, product quality,
        labelling, statutory compliance and fulfilment. The vendor of record for
        every product is clearly identified on the product and brand pages.
      </p>

      <h2>2. Products & information</h2>
      <p>
        Product information, ingredients and documentation are provided by
        vendors. Nutraatoz verifies vendors during onboarding and reviews
        listings, but does not manufacture the products. Nutraceuticals and
        dietary supplements are <strong>not intended to diagnose, treat, cure or
        prevent any disease</strong>. Always consult a qualified healthcare
        professional before use.
      </p>

      <h2>3. Orders & payment</h2>
      <p>
        Orders are subject to acceptance and product availability. Nutraatoz
        currently supports Cash on Delivery; online prepaid payments are being
        introduced. Prices are shown in INR and include applicable taxes unless
        stated otherwise.
      </p>

      <h2>4. Shipping, returns & refunds</h2>
      <p>
        Delivery timelines, returns and refunds are described on our{" "}
        <a href="/shipping">Shipping</a> and <a href="/returns">Returns</a>{" "}
        pages, which form part of these terms.
      </p>

      <h2>5. Accounts</h2>
      <p>
        You are responsible for keeping your account credentials secure and for
        activity under your account. You must provide accurate information.
      </p>

      <h2>6. Acceptable use</h2>
      <p>
        You agree not to misuse the platform, post unlawful content, or attempt
        to disrupt the service. Vendors additionally agree to the{" "}
        <a href="/vendor-agreement">Vendor Agreement</a>.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the extent permitted by law, Nutraatoz is not liable for indirect or
        consequential losses arising from marketplace transactions between
        consumers and vendors.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms; material changes will be reflected here.
        Questions? Email <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a>.
      </p>

      <p className="text-xs">
        This page is provided for general information and is not legal advice.
        Please have final terms reviewed by qualified counsel before relying on
        them commercially.
      </p>
    </PageShell>
  );
}
