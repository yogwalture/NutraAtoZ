import { notFound, redirect } from "next/navigation";
import { getAgentContext, getLeadWithCalls } from "@/lib/agentData";
import LeadWorkspace from "@/components/agent/LeadWorkspace";

export const dynamic = "force-dynamic";

export default async function AgentLeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ctx = await getAgentContext();
  if (!ctx.isAgent) redirect("/agent/login");

  const { lead, calls } = await getLeadWithCalls(params.id);
  if (!lead) notFound();

  // Agents may only open their own leads; admins may open any.
  if (!ctx.isAdmin && lead.assigned_agent_id !== ctx.userId) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/50 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          This lead isn&apos;t assigned to you.
        </p>
        <a
          href="/agent/leads"
          className="mt-3 inline-block text-sm font-semibold text-coral-600 hover:underline"
        >
          ← Back to my leads
        </a>
      </div>
    );
  }

  return <LeadWorkspace lead={lead} calls={calls} />;
}
