import { getAgentContext, getAgentQueue } from "@/lib/agentData";
import AgentLeadsList from "@/components/agent/AgentLeadsList";

export const dynamic = "force-dynamic";

export default async function AgentQueuePage() {
  const ctx = await getAgentContext();
  const scope = ctx.isAdmin ? null : ctx.userId;
  const queue = await getAgentQueue(scope);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Call queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {queue.length} lead{queue.length === 1 ? "" : "s"} due for a call or
          follow-up today or earlier. Tap a phone number to dial.
        </p>
      </div>
      <AgentLeadsList
        leads={queue}
        emptyLabel="Your queue is clear — no callbacks due. 🎉"
      />
    </div>
  );
}
