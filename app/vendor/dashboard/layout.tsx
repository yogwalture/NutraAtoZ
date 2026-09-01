import type { Metadata } from "next";
import { Store, ArrowRight, Clock } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getVendorContext } from "@/lib/vendorData";

export const metadata: Metadata = {
  title: "Vendor Dashboard — Nutraatoz",
};

// Always render fresh data (no static caching of vendor-scoped queries).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getVendorContext();

  // Signed in (middleware guarantees a user) but no vendor store is linked
  // to this account yet — prompt them to apply. Their application auto-links
  // once its contact email matches this account.
  if (ctx.configured && ctx.authed && !ctx.vendor) {
    return (
      <DashboardShell vendorName="Your Store" approved={false}>
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Store className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
            No store linked yet
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            This account isn&apos;t linked to a vendor store. Complete your
            vendor application to start selling. If you&apos;ve already applied,
            sign in with the same email you used on the application and it will
            link automatically.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <a
              href="/vendor/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
            >
              Become a vendor
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Applications are reviewed before your store goes live.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const vendorName =
    ctx.vendor?.store_name || ctx.vendor?.company_name || "Your Store";

  return (
    <DashboardShell
      vendorName={vendorName}
      approved={Boolean(ctx.vendor?.is_approved)}
    >
      {children}
    </DashboardShell>
  );
}
