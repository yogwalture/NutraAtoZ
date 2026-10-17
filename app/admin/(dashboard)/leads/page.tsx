import { getAllLeads } from "@/lib/adminData";
import { getAgents } from "@/lib/agentData";
import LeadsBoard from "@/components/admin/LeadsBoard";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const [leads, agents] = await Promise.all([getAllLeads(), getAgents()]);
  return <LeadsBoard leads={leads} agents={agents} />;
}
