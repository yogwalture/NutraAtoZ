"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAgentContext, type AgentContext, type AgentLead } from "@/lib/agentData";
import { parseProduct } from "@/lib/productForm";
import { isMailerConfigured, sendActionLinkEmail } from "@/lib/email";

export interface AgentActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  /** Returned vendor id after a conversion. */
  vendorId?: string;
  /** One-time / shareable link (registration or activation). */
  link?: string;
  /** Email the link was (or should be) sent to. */
  email?: string;
}

/** Public site origin used for shareable links. */
const SITE_URL = "https://nutraatoz.com";

const LEAD_STAGES = ["LEAD", "CONTACTED", "ONBOARDING", "LIVE", "LOST"];

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

/** Resolve the caller; only agents (and admins) may use these actions. */
async function requireAgent(): Promise<
  { ctx: AgentContext } | { error: AgentActionResult }
> {
  const ctx = await getAgentContext();
  if (!ctx.isAgent || !ctx.userId) {
    return { error: { ok: false, error: "Not authorised." } };
  }
  return { ctx };
}

/**
 * Fetches a lead and confirms the caller may act on it: admins may act on any
 * lead; agents only on leads assigned to them. Returns the lead row or an error.
 */
async function leadAccess(
  ctx: AgentContext,
  leadId: string
): Promise<{ lead: AgentLead } | { error: AgentActionResult }> {
  const { data: lead } = await supabaseAdmin
    .from("vendor_leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return { error: { ok: false, error: "Lead not found." } };
  if (!ctx.isAdmin && lead.assigned_agent_id !== ctx.userId) {
    return { error: { ok: false, error: "This lead is not assigned to you." } };
  }
  return { lead: lead as AgentLead };
}

function revalidateAgent(leadId?: string) {
  revalidatePath("/agent");
  revalidatePath("/agent/leads");
  revalidatePath("/agent/queue");
  if (leadId) revalidatePath(`/agent/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

/* ------------------------------------------------------------------ *
 * Telecalling — log a call outcome
 * ------------------------------------------------------------------ */

export async function logCall(
  leadId: string,
  formData: FormData
): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;
  const access = await leadAccess(auth.ctx, leadId);
  if ("error" in access) return access.error;

  const disposition = String(formData.get("disposition") ?? "").trim().toUpperCase();
  if (!disposition) return { ok: false, error: "Choose a call outcome." };

  const notes = str(formData.get("notes"));
  const callbackRaw = str(formData.get("callback_at"));
  const callback_at = callbackRaw ? new Date(callbackRaw).toISOString() : null;

  const nowIso = new Date().toISOString();

  const { error: callErr } = await supabaseAdmin.from("call_logs").insert({
    lead_id: leadId,
    agent_id: auth.ctx.userId,
    agent_email: auth.ctx.email,
    disposition,
    notes,
    callback_at,
  });
  if (callErr) return { ok: false, error: callErr.message };

  // Update the lead: mark last contacted, schedule any callback, and nudge the
  // stage to CONTACTED on first real contact.
  const update: Record<string, unknown> = {
    last_contacted_at: nowIso,
    updated_at: nowIso,
  };
  if (callback_at) update.next_follow_up_at = callback_at;
  if (access.lead.stage === "LEAD" && disposition !== "WRONG_NUMBER") {
    update.stage = "CONTACTED";
  }
  if (disposition === "NOT_INTERESTED") update.stage = "LOST";

  const { error: leadErr } = await supabaseAdmin
    .from("vendor_leads")
    .update(update)
    .eq("id", leadId);
  if (leadErr) return { ok: false, error: leadErr.message };

  revalidateAgent(leadId);
  return { ok: true, message: "Call logged." };
}

/* ------------------------------------------------------------------ *
 * Lead stage + follow-up scheduling
 * ------------------------------------------------------------------ */

export async function agentSetLeadStage(
  leadId: string,
  stage: string
): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;
  const access = await leadAccess(auth.ctx, leadId);
  if ("error" in access) return access.error;

  const s = String(stage).trim().toUpperCase();
  if (!LEAD_STAGES.includes(s)) return { ok: false, error: "Invalid stage." };

  const { error } = await supabaseAdmin
    .from("vendor_leads")
    .update({ stage: s, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  revalidateAgent(leadId);
  return { ok: true };
}

export async function setFollowUp(
  leadId: string,
  whenIso: string | null
): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;
  const access = await leadAccess(auth.ctx, leadId);
  if ("error" in access) return access.error;

  const next = whenIso ? new Date(whenIso).toISOString() : null;
  const { error } = await supabaseAdmin
    .from("vendor_leads")
    .update({ next_follow_up_at: next, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  revalidateAgent(leadId);
  return { ok: true };
}

/** An agent claims an unassigned lead for themselves. */
export async function claimLead(leadId: string): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;

  const { data: lead } = await supabaseAdmin
    .from("vendor_leads")
    .select("id, assigned_agent_id")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return { ok: false, error: "Lead not found." };
  if (lead.assigned_agent_id && lead.assigned_agent_id !== auth.ctx.userId) {
    return { ok: false, error: "That lead is already assigned to another agent." };
  }

  const { error } = await supabaseAdmin
    .from("vendor_leads")
    .update({ assigned_agent_id: auth.ctx.userId, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  revalidateAgent(leadId);
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * Conversion — self-serve registration link OR agent-assisted vendor
 * ------------------------------------------------------------------ */

/**
 * Emails the lead a link to self-register on the public onboarding form and
 * moves the lead to ONBOARDING. Also returns the link so the agent can copy it.
 */
export async function sendRegistrationLink(
  leadId: string
): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;
  const access = await leadAccess(auth.ctx, leadId);
  if ("error" in access) return access.error;

  const lead = access.lead;
  const email = lead.contact_email ?? undefined;
  const link = `${SITE_URL}/vendor/onboarding?ref=lead_${lead.id}`;

  let message: string | undefined;
  if (email && isMailerConfigured()) {
    const sent = await sendActionLinkEmail({
      to: email,
      subject: "Register your brand on Nutraatoz",
      heading: "You're invited to sell on Nutraatoz",
      intro: `Hi ${lead.contact_name || lead.company_name}, complete your vendor registration to start listing your products on India's verified nutraceutical marketplace. It only takes a few minutes.`,
      actionLink: link,
      buttonLabel: "Start registration",
    });
    message = sent.ok
      ? `Registration link emailed to ${email}.`
      : `Couldn't email the link (${sent.error}). Copy it below and send it manually.`;
  } else if (email) {
    message = `Email isn't configured, so copy the link below and send it to ${email}.`;
  } else {
    message = "No email on file — copy the link below and share it with the lead.";
  }

  await supabaseAdmin
    .from("vendor_leads")
    .update({ stage: "ONBOARDING", updated_at: new Date().toISOString() })
    .eq("id", leadId);

  revalidateAgent(leadId);
  return { ok: true, link, email, message };
}

function vendorFieldsFromForm(formData: FormData) {
  return {
    company_name: str(formData.get("company_name")),
    store_name: str(formData.get("store_name")),
    contact_person: str(formData.get("contact_person")),
    contact_email: str(formData.get("contact_email")),
    contact_phone: str(formData.get("contact_phone")),
    address_line: str(formData.get("address_line")),
    city: str(formData.get("city")),
    state: str(formData.get("state")),
    pincode: str(formData.get("pincode")),
    gstin: str(formData.get("gstin")),
    pan: str(formData.get("pan")),
    fssai_license_no: str(formData.get("fssai_license_no")),
    fssai_expiry: str(formData.get("fssai_expiry")),
    bank_name: str(formData.get("bank_name")),
    bank_ifsc: str(formData.get("bank_ifsc")),
    bank_account_number: str(formData.get("bank_account_number")),
    bank_account_holder: str(formData.get("bank_account_holder")),
  };
}

/**
 * Agent-assisted conversion: creates a pending vendor record from the
 * registration details the agent captured on the vendor's behalf, links it to
 * the lead, and advances the lead to ONBOARDING. Statutory fields that the
 * agent couldn't collect yet are left for the admin to verify before approval.
 */
export async function convertLeadToVendor(
  leadId: string,
  formData: FormData
): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;
  const access = await leadAccess(auth.ctx, leadId);
  if ("error" in access) return access.error;

  if (access.lead.converted_vendor_id) {
    return {
      ok: true,
      vendorId: access.lead.converted_vendor_id,
      message: "This lead already has a vendor record.",
    };
  }

  const fields = vendorFieldsFromForm(formData);
  const company_name = fields.company_name ?? access.lead.company_name;
  const store_name = fields.store_name ?? company_name;
  if (!company_name) return { ok: false, error: "Company / brand name is required." };

  const { data: inserted, error } = await supabaseAdmin
    .from("vendors")
    .insert({
      ...fields,
      company_name,
      store_name,
      contact_email: fields.contact_email ?? access.lead.contact_email,
      contact_phone: fields.contact_phone ?? access.lead.contact_phone,
      contact_person: fields.contact_person ?? access.lead.contact_name,
      city: fields.city ?? access.lead.city,
      state: fields.state ?? access.lead.state,
      is_approved: false,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: `Could not create vendor: ${error.message}` };

  const vendorId = inserted?.id as string | undefined;
  await supabaseAdmin
    .from("vendor_leads")
    .update({
      converted_vendor_id: vendorId,
      stage: "ONBOARDING",
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  revalidateAgent(leadId);
  revalidatePath("/admin/vendors");
  return {
    ok: true,
    vendorId,
    message:
      "Vendor created (pending verification). Add their products below, then an admin can verify & approve to go live.",
  };
}

/**
 * Agent adds a product to a vendor they converted. The vendor must be the
 * lead's converted vendor and the lead must be accessible to the caller.
 */
export async function agentAddProduct(
  leadId: string,
  formData: FormData
): Promise<AgentActionResult> {
  const auth = await requireAgent();
  if ("error" in auth) return auth.error;
  const access = await leadAccess(auth.ctx, leadId);
  if ("error" in access) return access.error;

  const vendorId = access.lead.converted_vendor_id;
  if (!vendorId)
    return { ok: false, error: "Convert this lead to a vendor first." };

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { error } = await supabaseAdmin.from("products").insert({
    vendor_id: vendorId,
    ...parsed.values,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidateAgent(leadId);
  revalidatePath("/admin/products");
  return { ok: true, message: "Product added." };
}
