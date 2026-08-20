import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Returns — Nutraatoz" };

export default function ReturnsPage() {
  return (
    <PageShell
      title="Returns & refunds"
      tagline="Your satisfaction matters. Here's how returns work."
    >
      <h2>Return window</h2>
      <p>
        You can request a return within <strong>7 days of delivery</strong> for
        items that are unopened, unused, and in their original sealed packaging.
      </p>

      <h2>Non-returnable items</h2>
      <p>
        For safety and hygiene reasons, opened or partially used supplements
        cannot be returned unless the product is damaged, defective, or incorrect.
      </p>

      <h2>Damaged or wrong items</h2>
      <p>
        Received something damaged or not as described? Email{" "}
        <a href="mailto:support@nutraatoz.com">support@nutraatoz.com</a> within 48
        hours of delivery with your order number and a photo, and we&apos;ll
        arrange a replacement or refund.
      </p>

      <h2>Refunds</h2>
      <p>
        Approved refunds are processed to your original payment method within
        5–7 business days. For Cash on Delivery orders, we&apos;ll collect your
        bank details to process the refund.
      </p>
    </PageShell>
  );
}
