import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Shipping — Nutraatoz" };

export default function ShippingPage() {
  return (
    <PageShell
      title="Shipping"
      tagline="How and when your order reaches you."
    >
      <h2>Delivery timelines</h2>
      <p>
        Orders are typically dispatched within 1–2 business days and delivered
        within <strong>3–7 business days</strong>, depending on your pincode.
        Remote locations may take a little longer.
      </p>

      <h2>Shipping charges</h2>
      <p>
        Enjoy <strong>free shipping on orders above ₹999</strong>. For orders
        below that, a flat delivery fee is shown at checkout before you confirm.
      </p>

      <h2>Tracking</h2>
      <p>
        Once your order ships, we&apos;ll share tracking details by SMS/email so
        you can follow it to your door.
      </p>

      <h2>Serviceable areas</h2>
      <p>
        We currently ship across India. If checkout doesn&apos;t accept your
        pincode, email{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a> and
        we&apos;ll help.
      </p>
    </PageShell>
  );
}
