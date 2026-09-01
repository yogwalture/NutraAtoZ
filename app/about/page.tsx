import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "About — Nutraatoz" };

export default function AboutPage() {
  return (
    <PageShell
      title="About Nutraatoz"
      tagline="A curated marketplace built on one promise: every vendor is FSSAI-verified, with transparent product documentation."
    >
      <p>
        Nutraatoz is a premium, multi-vendor marketplace for nutraceuticals in
        India. We bring together trusted supplement brands under one roof, so
        you can shop with confidence knowing that quality, compliance, and
        transparency come standard.
      </p>

      <h2>What makes us different</h2>
      <p>
        Every brand on Nutraatoz is <strong>FSSAI-verified</strong> and every
        product is backed by a <strong>third-party Certificate of Analysis</strong>.
        No proprietary blends, no guesswork — just clean, honest labelling and
        independent testing you can check for yourself.
      </p>

      <h2>Our mission</h2>
      <p>
        Wellness should be simple and trustworthy. We handle the vetting —
        statutory licenses, lab reports, and vendor compliance — so you can focus
        on your goals. From immunity and gut health to sleep, energy and beauty,
        we curate supplements that actually earn their place in your routine.
      </p>

      <h2>For brands</h2>
      <p>
        Are you a manufacturer or brand owner? Join a curated, high-intent
        audience and let us handle discovery and settlements. <a href="/vendor/onboarding">Become a vendor</a> in
        about five minutes.
      </p>
    </PageShell>
  );
}
