import type { Metadata } from "next";
import { Leaf, ShieldCheck } from "lucide-react";
import VendorOnboardingForm from "@/components/onboarding/VendorOnboardingForm";

export const metadata: Metadata = {
  title: "Become a Vendor — Nutraatoz",
  description:
    "Self-onboarding for nutraceutical vendors. Submit your company, tax, and FSSAI compliance details to start selling on Nutraatoz.",
};

export default function VendorOnboardingPage() {
  return (
    <div className="min-h-screen bg-grain">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">
              <Leaf className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight text-primary">
              Nutra<span className="text-accent">atoz</span>
            </span>
          </a>
          <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Verified vendor program
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Sell on Nutraatoz
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Join our curated marketplace of lab-tested nutraceuticals. Complete
            the three steps below — it takes about five minutes.
          </p>
        </div>

        <VendorOnboardingForm />
      </main>
    </div>
  );
}
