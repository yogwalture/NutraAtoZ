import "server-only";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { LeadStage } from "@/lib/adminData";

/* ------------------------------------------------------------------ *
 * Agent auth context
 * ------------------------------------------------------------------ */

export interface AgentContext {
  userId: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  /** agents AND admins may use the agent portal */
  isAgent: boolean;
  isAdmin: boolean;
}

export async function getAgentContext(): Promise<AgentContext> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      userId: null,
      email: null,
      fullName: null,
      role: null,
      isAgent: false,
      isAdmin: false,
    };
  }
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role as string | null) ?? null;
  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? null,
    role,
    isAgent: role === "agent" || role === "admin",
    isAdmin: role === "admin",
  };
}

/* ------------------------------------------------------------------ *
 * Lead + call-log shapes
 * ------------------------------------------------------------------ */

export interface AgentLead {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  stage: LeadStage;
  notes: string | null;
  product_category: string | null;
  message: string | null;
  assigned_agent_id: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  converted_vendor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  lead_id: string;
  agent_id: string | null;
  agent_email: string | null;
  disposition: string;
  notes: string | null;
  callback_at: string | null;
  created_at: string;
}

const LEAD_COLS =
  "id, company_name, contact_name, contact_email, contact_phone, city, state, source, stage, notes, product_category, message, assigned_agent_id, next_follow_up_at, last_contacted_at, converted_vendor_id, created_at, updated_at";

/** Leads assigned to this agent (admins pass null to get all). */
export async function getAgentLeads(agentId: string | null): Promise<AgentLead[]> {
  let q = supabaseAdmin.from("vendor_leads").select(LEAD_COLS);
  if (agentId) q = q.eq("assigned_agent_id", agentId);
  const { data } = await q
    .order("next_follow_up_at", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });
  return (data ?? []) as AgentLead[];
}

/** Leads due for a callback today or earlier. */
export async function getAgentQueue(agentId: string | null): Promise<AgentLead[]> {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  let q = supabaseAdmin
    .from("vendor_leads")
    .select(LEAD_COLS)
    .not("next_follow_up_at", "is", null)
    .lte("next_follow_up_at", endOfToday.toISOString());
  if (agentId) q = q.eq("assigned_agent_id", agentId);
  const { data } = await q.order("next_follow_up_at", { ascending: true });
  return (data ?? []) as AgentLead[];
}

export async function getLeadWithCalls(
  leadId: string
): Promise<{ lead: AgentLead | null; calls: CallLog[] }> {
  const { data: lead } = await supabaseAdmin
    .from("vendor_leads")
    .select(LEAD_COLS)
    .eq("id", leadId)
    .maybeSingle();
  const { data: calls } = await supabaseAdmin
    .from("call_logs")
    .select("id, lead_id, agent_id, agent_email, disposition, notes, callback_at, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return {
    lead: (lead as AgentLead | null) ?? null,
    calls: (calls ?? []) as CallLog[],
  };
}

export interface AgentStats {
  total: number;
  byStage: Record<string, number>;
  callbacksDue: number;
  callsToday: number;
}

export async function getAgentStats(agentId: string | null): Promise<AgentStats> {
  const leads = await getAgentLeads(agentId);
  const byStage: Record<string, number> = {};
  for (const l of leads) byStage[l.stage] = (byStage[l.stage] ?? 0) + 1;

  const queue = await getAgentQueue(agentId);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  let cq = supabaseAdmin
    .from("call_logs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfToday.toISOString());
  if (agentId) cq = cq.eq("agent_id", agentId);
  const { count: callsToday } = await cq;

  return {
    total: leads.length,
    byStage,
    callbacksDue: queue.length,
    callsToday: callsToday ?? 0,
  };
}

/** For admin assignment dropdowns. */
export interface AgentSummary {
  id: string;
  email: string | null;
  full_name: string | null;
}

export async function getAgents(): Promise<AgentSummary[]> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .eq("role", "agent")
    .order("full_name", { ascending: true });
  return (data ?? []) as AgentSummary[];
}
