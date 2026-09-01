import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "FAQ — Nutraatoz" };

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Are the products on Nutraatoz genuine and verified?",
    a: "Every vendor on Nutraatoz is FSSAI-verified during onboarding. A Certificate of Analysis (CoA) is available on request for eligible products. Nutraatoz clearly distinguishes vendor-provided documentation from any documentation it has independently reviewed.",
  },
  {
    q: "How do I place an order?",
    a: "Browse the store, add items to your cart, and check out. We currently support Cash on Delivery, with online payments rolling out soon.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery is available today. Prepaid online payments (UPI, cards, netbanking) via Razorpay are being enabled.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders are delivered within 3–7 business days depending on your location. See our Shipping page for details.",
  },
  {
    q: "Can I return a product?",
    a: "Unopened items in original packaging can be returned within 7 days of delivery. See our Returns page for the full policy.",
  },
  {
    q: "How do I sell my brand on Nutraatoz?",
    a: "Complete the vendor onboarding — it takes about five minutes and requires your GSTIN, PAN, and FSSAI licence. Our team verifies and approves your store.",
  },
];

export default function FaqPage() {
  return (
    <PageShell
      title="Frequently asked questions"
      tagline="Everything you need to know about shopping and selling on Nutraatoz."
    >
      <div className="space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-coral/15 bg-white p-4 shadow-card"
          >
            <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-mist">{item.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
