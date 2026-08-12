import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminContext } from "@/lib/adminData";

export const metadata: Metadata = {
  title: "Admin Console — Nutraatoz",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) {
    redirect("/admin/login");
  }
  return <AdminShell email={ctx.email}>{children}</AdminShell>;
}
