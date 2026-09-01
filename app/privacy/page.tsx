import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Privacy Policy — Nutraatoz" };

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      tagline="How Nutraatoz collects, uses and protects your information."
    >
      <p>
        This policy explains what data we collect and how we use it when you use
        Nutraatoz as a customer or vendor.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Customers:</strong> name, contact details, delivery address, and
        order history. <strong>Vendors:</strong> business details (company name,
        GSTIN, PAN, FSSAI), contact information, documents and bank/settlement
        details required to operate on the marketplace.
      </p>

      <h2>How we use it</h2>
      <p>
        To process orders and settlements, verify vendors, provide support,
        prevent fraud, comply with legal obligations, and improve the platform.
        We do not sell your personal data.
      </p>

      <h2>Storage & security</h2>
      <p>
        Data is stored using industry-standard providers with access controls.
        Sensitive documents and bank details are restricted to authorised
        processing and are never displayed publicly.
      </p>

      <h2>Sharing</h2>
      <p>
        We share only what is necessary with logistics, payment and verification
        partners to fulfil orders and operate the marketplace, and with
        authorities where legally required.
      </p>

      <h2>Your choices</h2>
      <p>
        You may request access to or deletion of your personal data, subject to
        legal and record-keeping requirements, by emailing{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and remember cart/session
        preferences.
      </p>

      <p className="text-xs">
        This page is provided for general information and is not legal advice.
        Please have your final privacy policy reviewed by qualified counsel.
      </p>
    </PageShell>
  );
}
