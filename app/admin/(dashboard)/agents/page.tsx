import { getAgents } from "@/lib/agentData";
import { getAllLeads } from "@/lib/adminData";
import AgentsManager from "@/components/admin/AgentsManager";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const [agents, leads] = await Promise.all([getAgents(), getAllLeads()]);

  const counts = new Map<string, number>();
  for (const l of leads) {
    if (l.assigned_agent_id)
      counts.set(l.assigned_agent_id, (counts.get(l.assigned_agent_id) ?? 0) + 1);
  }

  const rows = agents.map((a) => ({
    ...a,
    leadCount: counts.get(a.id) ?? 0,
  }));

  return <AgentsManager agents={rows} />;
}
