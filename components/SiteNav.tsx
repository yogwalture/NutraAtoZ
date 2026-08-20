"use client";

import { useEffect, useState } from "react";
import { Menu, X, Search, ShoppingBag, ChevronRight, Store } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/lib/data";
import { useCart } from "@/components/cart/CartProvider";

/**
 * Responsive site navigation.
 *  - Large desktop (lg+): spacious full header menu.
 *  - Tablet (md → lg): compact top bar with a hamburger that opens a side drawer.
 *  - Mobile (< md): compact top bar + fixed bottom-bar navigation.
 */
export default function SiteNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState("/");
  const { count } = useCart();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* ============ DESKTOP HEADER (lg and up) ============ */}
      <header className="sticky top-0 z-40 hidden border-b border-white/60 bg-white/70 shadow-float backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-8">
          <Logo />

          <nav className="flex flex-1 items-center justify-center gap-1">
            {navLinks
              .filter((l) => !["Cart", "Account"].includes(l.label))
              .map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActive(link.href)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    active === link.href
                      ? "bg-citrus-gradient text-white shadow-glow-coral"
                      : "text-ink/70 hover:bg-coral/10 hover:text-coral-600"
                  }`}
                >
                  {link.label}
                </a>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/search"
              aria-label="Search"
              className="grid h-11 w-11 place-items-center rounded-full text-ink/70 transition-colors hover:bg-coral/10 hover:text-coral-600"
            >
              <Search className="h-5 w-5" />
            </a>
            <a
              href="/cart"
              aria-label="Cart"
              className="relative grid h-11 w-11 place-items-center rounded-full text-ink/70 transition-colors hover:bg-coral/10 hover:text-coral-600"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-berry px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </a>
            <a
              href="/vendor/onboarding"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-coral/25 px-5 py-2.5 text-sm font-bold text-coral-700 transition-colors hover:bg-coral/10"
            >
              <Store className="h-4 w-4" />
              Become a Vendor
            </a>
            <a
              href="/login"
              className="shine ml-1 inline-flex items-center rounded-full bg-citrus-gradient px-6 py-2.5 text-sm font-bold text-white shadow-glow-coral transition-all hover:-translate-y-0.5"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* ============ TABLET + MOBILE TOP BAR (below lg) ============ */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 shadow-float backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <button
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="hidden h-11 w-11 place-items-center rounded-xl text-coral-600 transition-colors hover:bg-coral/10 md:grid"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Logo />

          <div className="flex items-center gap-1">
            <a
              href="/search"
              aria-label="Search"
              className="grid h-11 w-11 place-items-center rounded-xl text-ink/70 transition-colors hover:bg-coral/10 hover:text-coral-600"
            >
              <Search className="h-5 w-5" />
            </a>
            <a
              href="/cart"
              aria-label="Cart"
              className="relative grid h-11 w-11 place-items-center rounded-xl text-ink/70 transition-colors hover:bg-coral/10 hover:text-coral-600"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-berry px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      {/* ============ TABLET SIDE DRAWER ============ */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-plum/40 backdrop-blur-sm transition-opacity duration-300 md:block lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-80 flex-col bg-cream shadow-card-hover transition-transform duration-300 ease-out md:flex lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between border-b border-coral/10 px-5 py-5">
          <Logo />
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink/70 transition-colors hover:bg-coral/10 hover:text-coral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = active === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  setActive(link.href);
                  setDrawerOpen(false);
                }}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-citrus-gradient text-white"
                    : "text-ink/80 hover:bg-coral/10 hover:text-coral-600"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {link.label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </a>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-coral/10 p-4">
          <a
            href="/vendor/onboarding"
            onClick={() => setDrawerOpen(false)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-coral/25 py-3.5 text-sm font-bold text-coral-700 transition-colors hover:bg-coral/10"
          >
            <Store className="h-4 w-4" />
            Become a Vendor
          </a>
          <a
            href="/login"
            onClick={() => setDrawerOpen(false)}
            className="block w-full rounded-xl bg-citrus-gradient py-3.5 text-center text-sm font-bold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            Sign In
          </a>
        </div>
      </aside>

      {/* ============ MOBILE BOTTOM BAR (below md) ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/80 shadow-bar backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = active === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.href)}
                className="group relative flex flex-1 flex-col items-center gap-1 py-2.5"
              >
                <span
                  className={`relative grid h-9 w-9 place-items-center rounded-full transition-all ${
                    isActive
                      ? "bg-citrus-gradient text-white shadow-glow-coral"
                      : "text-ink/60"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {link.label === "Cart" && count > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-berry px-1 text-[9px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? "text-coral-600" : "text-ink/50"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
