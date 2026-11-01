import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  notifyFollowupDigest,
  notifyFssaiExpiry,
  notifyReviewRequest,
  notifyStaleLeadsDigest,
  getAdminEmails,
} from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled-automation dispatcher. Trigger with an external scheduler (Coolify
 * scheduled task, cron-job.org, or Supabase pg_cron) hitting:
 *   GET https://nutraatoz.com/api/cron?job=<name>&key=<CRON_SECRET>
 *   (or send the secret as the `x-cron-key` header)
 *
 * Jobs: followups | fssai-expiry | review-requests | stale-leads | all
 * Every job is idempotent (notifications_log dedupe), so re-running is safe.
 */

const DAY = 24 * 3600 * 1000;

function iso(d: Date) {
  return d.toISOString();
}
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function agentEmailMap(): Promise<Map<string, string>> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("role", "agent");
  const m = new Map<string, string>();
  for (const a of data ?? []) if (a.email) m.set(a.id, a.email as string);
  return m;
}

/** Agents with leads due for follow-up today → a per-agent digest. */
async function runFollowups() {
  const agents = await agentEmailMap();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  let sent = 0;
  for (const [agentId, email] of agents) {
    const { count } = await supabaseAdmin
      .from("vendor_leads")
      .select("id", { count: "exact", head: true })
      .eq("assigned_agent_id", agentId)
      .not("next_follow_up_at", "is", null)
      .lte("next_follow_up_at", iso(endOfToday))
      .not("stage", "in", "(LIVE,LOST)");
    if ((count ?? 0) > 0) {
      await notifyFollowupDigest({
        to: email,
        agentId,
        day: todayKey(),
        count: count ?? 0,
        label: "Here's what's due today.",
      });
      sent++;
    }
  }
  return { agentsNotified: sent };
}

/** Vendors whose FSSAI licence expires within 30 days. */
async function runFssaiExpiry() {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * DAY);
  const { data } = await supabaseAdmin
    .from("vendors")
    .select("id, store_name, company_name, contact_email, fssai_expiry")
    .not("fssai_expiry", "is", null)
    .gte("fssai_expiry", now.toISOString().slice(0, 10))
    .lte("fssai_expiry", in30.toISOString().slice(0, 10));
  let notified = 0;
  for (const v of data ?? []) {
    const expiry = String(v.fssai_expiry);
    const daysLeft = Math.max(
      0,
      Math.round((new Date(expiry).getTime() - now.getTime()) / DAY)
    );
    await notifyFssaiExpiry({
      id: v.id,
      email: (v.contact_email as string | null) ?? null,
      storeName: (v.store_name as string) || (v.company_name as string) || "Vendor",
      expiry,
      daysLeft,
    });
    notified++;
  }
  return { vendorsFlagged: notified };
}

/** Delivered orders (>= 2 days ago) that haven't had a review request yet. */
async function runReviewRequests() {
  const cutoff = new Date(Date.now() - 2 * DAY);
  const { data } = await supabaseAdmin
    .from("orders")
    .select("id, customer_email, customer_name, shipping_status, shipping_updated_at")
    .eq("shipping_status", "DELIVERED")
    .not("customer_email", "is", null)
    .lte("shipping_updated_at", iso(cutoff))
    .limit(200);
  let sent = 0;
  for (const o of data ?? []) {
    await notifyReviewRequest({
      id: o.id,
      email: (o.customer_email as string | null) ?? null,
      name: (o.customer_name as string | null) ?? null,
    });
    sent++;
  }
  return { reviewRequests: sent };
}

/** Leads gone quiet (no contact in 7 days, or uncontacted 3+ days). */
async function runStaleLeads() {
  const sevenAgo = iso(new Date(Date.now() - 7 * DAY));
  const threeAgo = iso(new Date(Date.now() - 3 * DAY));
  const { data } = await supabaseAdmin
    .from("vendor_leads")
    .select("id, assigned_agent_id, last_contacted_at, created_at, stage")
    .not("stage", "in", "(LIVE,LOST)")
    .limit(500);

  const stale = (data ?? []).filter((l) => {
    if (l.last_contacted_at) return String(l.last_contacted_at) < sevenAgo;
    return String(l.created_at) < threeAgo;
  });
  if (stale.length === 0) return { staleLeads: 0, digests: 0 };

  const agents = await agentEmailMap();
  const byRecipient = new Map<string, { key: string; count: number }>();
  const admins = await getAdminEmails();

  for (const l of stale) {
    const agentEmail = l.assigned_agent_id
      ? agents.get(l.assigned_agent_id as string)
      : undefined;
    if (agentEmail) {
      const e = byRecipient.get(agentEmail) ?? {
        key: `agent:${l.assigned_agent_id}`,
        count: 0,
      };
      e.count++;
      byRecipient.set(agentEmail, e);
    } else {
      for (const a of admins) {
        const e = byRecipient.get(a) ?? { key: `admin:${a}`, count: 0 };
        e.count++;
        byRecipient.set(a, e);
      }
    }
  }

  let digests = 0;
  for (const [to, info] of byRecipient) {
    await notifyStaleLeadsDigest({
      to,
      key: info.key,
      day: todayKey(),
      count: info.count,
    });
    digests++;
  }
  return { staleLeads: stale.length, digests };
}

const JOBS: Record<string, () => Promise<unknown>> = {
  followups: runFollowups,
  "fssai-expiry": runFssaiExpiry,
  "review-requests": runReviewRequests,
  "stale-leads": runStaleLeads,
};

async function handle(request: Request) {
  const expected = process.env.CRON_SECRET ?? "";
  if (!expected) {
    return NextResponse.json({ error: "Cron not configured." }, { status: 503 });
  }
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-cron-key") || url.searchParams.get("key") || "";
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  const job = url.searchParams.get("job") || "all";
  const names = job === "all" ? Object.keys(JOBS) : [job];

  const results: Record<string, unknown> = {};
  for (const name of names) {
    const fn = JOBS[name];
    if (!fn) {
      results[name] = { error: "unknown job" };
      continue;
    }
    try {
      results[name] = await fn();
    } catch (e) {
      results[name] = { error: e instanceof Error ? e.message : "job failed" };
    }
  }

  return NextResponse.json({ ok: true, ran: names, results });
}

export async function GET(request: Request) {
  return handle(request);
}
export async function POST(request: Request) {
  return handle(request);
}
