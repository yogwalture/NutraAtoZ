import { getAgentContext, getAgentLeads } from "@/lib/agentData";
import AgentLeadsList from "@/components/agent/AgentLeadsList";

export const dynamic = "force-dynamic";

export default async function AgentLeadsPage() {
  const ctx = await getAgentContext();
  const scope = ctx.isAdmin ? null : ctx.userId;
  const leads = await getAgentLeads(scope);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          {ctx.isAdmin ? "All leads" : "My leads"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {leads.length} lead{leads.length === 1 ? "" : "s"}
          {ctx.isAdmin ? " across the team." : " assigned to you."}
        </p>
      </div>
      <AgentLeadsList
        leads={leads}
        showClaim={ctx.isAdmin}
        emptyLabel={
          ctx.isAdmin
            ? "No leads yet. They'll appear here as enquiries arrive."
            : "No leads assigned to you yet. Your admin will assign leads to your queue."
        }
      />
    </div>
  );
}
