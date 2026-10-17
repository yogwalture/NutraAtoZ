import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AgentShell from "@/components/agent/AgentShell";
import { getAgentContext } from "@/lib/agentData";

export const metadata: Metadata = {
  title: "Agent Portal — Nutraatoz",
};

export const dynamic = "force-dynamic";

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAgentContext();
  if (!ctx.isAgent) {
    redirect("/agent/login");
  }
  return (
    <AgentShell email={ctx.email} name={ctx.fullName} isAdmin={ctx.isAdmin}>
      {children}
    </AgentShell>
  );
}
