import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import CartContents from "@/components/cart/CartContents";

export const metadata: Metadata = {
  title: "Your Cart — Nutraatoz",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)]">
      <SiteNav />
      <main className="relative overflow-hidden pb-24 md:pb-0">
        <div className="orb orb-emerald left-[-6rem] top-0 h-64 w-64 animate-float-slow" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h1 className="mb-8 font-serif text-3xl font-semibold tracking-tight text-emerald sm:text-4xl">
            Your Cart
          </h1>
          <CartContents />
        </div>
        <Footer />
      </main>
    </div>
  );
}
