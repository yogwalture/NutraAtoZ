import type { Metadata } from "next";
import { Mail, Phone, MapPin, Store } from "lucide-react";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Contact — Nutraatoz" };

export default function ContactPage() {
  return (
    <PageShell
      title="Contact us"
      tagline="Questions about an order, a product, or selling on Nutraatoz? We're here to help."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ContactCard icon={<Mail className="h-5 w-5" />} label="Customer support">
          <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a>
        </ContactCard>
        <ContactCard icon={<Phone className="h-5 w-5" />} label="Phone">
          +91 90000 00000 · Mon–Sat, 10am–6pm IST
        </ContactCard>
        <ContactCard icon={<Store className="h-5 w-5" />} label="Sell with us">
          <a href="/vendor/onboarding">Become a vendor</a>
        </ContactCard>
        <ContactCard icon={<MapPin className="h-5 w-5" />} label="Registered office">
          Pune, Maharashtra, India
        </ContactCard>
      </div>

      <h2>Order help</h2>
      <p>
        For anything related to an existing order — delivery, returns, or a
        Certificate of Analysis — email{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a> with your
        order number and we&apos;ll get back to you within one business day.
      </p>
    </PageShell>
  );
}

function ContactCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-coral/15 bg-white p-4 shadow-card">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-citrus-gradient text-white">
        {icon}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-berry">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-ink">{children}</p>
      </div>
    </div>
  );
}
