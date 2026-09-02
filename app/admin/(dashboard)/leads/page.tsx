import { getAllLeads } from "@/lib/adminData";
import LeadsBoard from "@/components/admin/LeadsBoard";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await getAllLeads();
  return <LeadsBoard leads={leads} />;
}
