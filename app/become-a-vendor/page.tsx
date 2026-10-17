import type { Metadata } from "next";
import { ShieldCheck, Wallet, Headphones, BadgeCheck } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import EnquiryForm from "@/components/vendor/EnquiryForm";

export const metadata: Metadata = {
  title: "Become a Vendor — NutraAtoZ",
  description:
    "Enquire to sell your nutraceutical brand on NutraAtoZ. Share your details and our team will call you to guide onboarding — FSSAI-verified, secure settlements, pan-India reach.",
};

const POINTS = [
  { icon: ShieldCheck, title: "FSSAI-verified marketplace", body: "Lab-tested, compliant listings that customers trust." },
  { icon: Wallet, title: "Transparent settlements", body: "A simple commission and timely payouts to your account." },
  { icon: Headphones, title: "Assisted onboarding", body: "Our team helps you register and list your catalogue." },
  { icon: BadgeCheck, title: "Pan-India reach", body: "Sell to high-intent wellness shoppers across the country." },
];

export default function BecomeAVendorPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Vendor enquiry
              </span>
              <h1 className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
                Sell your brand on NutraAtoZ
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                Share a few details and our vendor team will call you to guide you
                through onboarding — from verification to your first product
                listing. It&apos;s quick, and there&apos;s no obligation.
              </p>

              <ul className="mt-8 space-y-4">
                {POINTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li key={p.title} className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.title}</p>
                        <p className="text-sm text-muted-foreground">{p.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-8 text-sm text-muted-foreground">
                Ready to register right away?{" "}
                <a href="/vendor/onboarding" className="font-semibold text-coral-600 hover:underline">
                  Start the full application →
                </a>
              </p>
            </div>

            <div className="lg:sticky lg:top-24">
              <EnquiryForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
