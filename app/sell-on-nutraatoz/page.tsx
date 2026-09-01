import type { Metadata } from "next";
import {
  Store,
  ArrowRight,
  CalendarClock,
  MapPin,
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  Wallet,
  Truck,
  BarChart3,
  UploadCloud,
  Headphones,
  ClipboardCheck,
  BadgeCheck,
  Award,
  FileCheck,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import EarningsCalculator from "@/components/vendor/EarningsCalculator";

export const metadata: Metadata = {
  title: "Sell on NutraAtoZ — Grow your nutraceutical brand",
  description:
    "Reach customers across India through a specialized nutraceutical marketplace. FSSAI-verified onboarding, a dedicated brand storefront, secure payments and a simple 15% marketplace commission.",
};

const BENEFITS = [
  { icon: MapPin, title: "Pan-India customer reach", body: "Sell to customers across India without building your own logistics and demand engine." },
  { icon: Sparkles, title: "Specialized nutraceutical audience", body: "Reach high-intent shoppers actively looking for supplements — not a generic marketplace crowd." },
  { icon: LayoutGrid, title: "Need-based product discovery", body: "Your products surface by wellness goals, ingredients and preferences buyers actually search for." },
  { icon: Store, title: "Dedicated brand storefront", body: "A verified, professional brand page that showcases your catalogue and builds trust." },
  { icon: UploadCloud, title: "Assisted catalogue onboarding", body: "Bulk-upload your products and get help getting them listed cleanly and compliantly." },
  { icon: Wallet, title: "Secure payments & settlements", body: "Transparent settlements to your registered account, with a simple 15% marketplace commission." },
  { icon: Truck, title: "Integrated shipping & orders", body: "Manage orders and dispatch from one dashboard as the platform's logistics rolls out." },
  { icon: BarChart3, title: "Vendor analytics", body: "See views, add-to-carts, conversion and sales so you can grow what works." },
];

const STEPS = [
  { icon: ClipboardCheck, title: "Register", body: "Apply in ~5 minutes with your GSTIN, PAN and FSSAI details." },
  { icon: ShieldCheck, title: "Get verified", body: "We review your business and documentation before your store goes live." },
  { icon: UploadCloud, title: "Upload products", body: "Add your catalogue — manually or in bulk — with assisted onboarding." },
  { icon: BadgeCheck, title: "Sell & grow", body: "Reach customers across India and track performance from your dashboard." },
];

const FOUNDING = [
  "Founding Vendor badge on your storefront",
  "Priority onboarding & assisted catalogue setup",
  "Featured brand placement opportunities",
  "Early access to new marketplace features",
  "Special introductory commercial terms (subject to approval)",
];

export default function SellOnNutraatozPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        {/* Hero */}
        <section className="relative overflow-hidden bg-citrus-mesh">
          <div className="orb orb-coral left-[-6rem] top-[-4rem] h-72 w-72 animate-float-slow" />
          <div className="orb orb-amber right-[-5rem] top-16 h-72 w-72 animate-float" />
          <div className="absolute inset-0 bg-grain opacity-60" />
          <div className="relative z-10 mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-coral-700 shadow-float backdrop-blur">
              <Store className="h-4 w-4 text-berry" />
              For manufacturers, brands, distributors, wholesalers &amp; importers
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[2.5rem] font-semibold leading-[1.03] tracking-tight text-ink sm:text-6xl">
              Grow your nutraceutical brand with{" "}
              <span className="text-gradient">NutraAtoZ</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              Reach customers across India through a specialized nutraceutical
              marketplace built for product discovery, trust and digital
              commerce — an additional digital sales channel for your brand.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/vendor/onboarding"
                className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-8 py-4 text-sm font-bold text-white shadow-glow-coral transition-all hover:-translate-y-0.5"
              >
                Become a Vendor
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:nutraatoz@gmail.com?subject=Vendor%20demo%20request"
                className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-white/70 px-8 py-4 text-sm font-bold text-coral-700 shadow-float backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                <CalendarClock className="h-4 w-4" />
                Book a Vendor Demo
              </a>
            </div>
            <p className="mt-4 text-xs text-mist">
              Already applied? <a href="/vendor/login" className="font-medium text-coral-600 hover:underline">Vendor login</a>
            </p>
          </div>
        </section>

        {/* Trust strip */}
        <div className="border-y border-white/60 bg-citrus-gradient py-3.5">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 text-sm font-semibold text-white/95">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> FSSAI-verified onboarding</span>
            <span className="inline-flex items-center gap-2"><FileCheck className="h-4 w-4" /> Document transparency</span>
            <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" /> Simple 15% commission</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Pan-India reach</span>
          </div>
        </div>

        {/* Benefits */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Why sell on <span className="text-gradient">NutraAtoZ</span>
            </h2>
            <p className="mt-3 text-sm text-mist sm:text-base">
              Everything you need to reach nutraceutical customers and run your
              store — without building it all yourself.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-3xl border border-coral/15 bg-white p-5 shadow-card">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-citrus-gradient text-white shadow-glow-coral">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-ink">{b.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-mist">{b.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-citrus-soft py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                From application to your first sale
              </h2>
              <p className="mt-3 text-sm text-mist sm:text-base">
                A clear, verification-first path to going live.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="relative rounded-3xl border border-white/70 bg-white p-6 shadow-card">
                    <span className="absolute right-5 top-5 font-serif text-2xl font-bold text-coral/20">
                      {i + 1}
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral/10 text-coral-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-bold text-ink">{s.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-mist">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Commercials + calculator */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Simple, transparent commercials
              </h2>
              <p className="mt-3 text-sm text-mist sm:text-base">
                One clear platform fee: a <strong className="text-ink">15% marketplace
                commission</strong> on the product selling price. Onboarding,
                payment-gateway, shipping and promotional costs depend on your
                agreement — and where a charge is zero, we say so.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-mist">
                {[
                  "15% marketplace commission — the platform's core fee",
                  "Transparent settlements to your registered account",
                  "No hidden fees; taxes apply as per law",
                  "Access another digital sales channel — not a guarantee of sales",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-coral-600" />
                    {t}
                  </li>
                ))}
              </ul>
              <a
                href="/vendor-terms"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-coral-600 hover:underline"
              >
                Read full commercial terms
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <EarningsCalculator />
          </div>
        </section>

        {/* Founding vendor */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-citrus-gradient px-6 py-12 shadow-glow-coral sm:px-12 sm:py-14">
            <div className="orb orb-amber right-[-3rem] top-[-3rem] h-56 w-56 opacity-40" />
            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  <Award className="h-4 w-4" />
                  Founding Vendor Program
                </span>
                <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Be one of our founding nutraceutical brands
                </h2>
                <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                  Join early and help shape the marketplace. Founding vendors get
                  hands-on onboarding and early visibility as we grow.
                </p>
                <a
                  href="/vendor/onboarding"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-coral-700 shadow-float transition-transform hover:-translate-y-0.5"
                >
                  Apply as a Founding Vendor
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <ul className="space-y-2.5 rounded-3xl bg-white/10 p-5 backdrop-blur">
                {FOUNDING.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-5 pb-20 text-center sm:px-8">
          <Headphones className="mx-auto h-8 w-8 text-coral-600" />
          <h2 className="mt-3 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Ready to reach more customers?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-mist">
            Apply now, or email us for a walkthrough — our vendor team is happy to
            help you get set up.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/vendor/onboarding"
              className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-8 py-4 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
            >
              Become a Vendor
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:nutraatoz@gmail.com?subject=Vendor%20enquiry"
              className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-white px-8 py-4 text-sm font-bold text-coral-700 shadow-card transition-transform hover:-translate-y-0.5"
            >
              Talk to the vendor team
            </a>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
