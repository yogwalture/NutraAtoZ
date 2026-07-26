import type { Metadata } from "next";
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
