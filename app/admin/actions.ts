"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminContext } from "@/lib/adminData";
import { parseProduct } from "@/lib/productForm";

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
}

/** Public site origin used for auth email redirect links. */
const SITE_URL = "https://nutraatoz.com";

async function requireAdmin(): Promise<ActionResult | null> {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return { ok: false, error: "Not authorised." };
  return null;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

/** Admin creates a vendor directly (auto-approved). */
export async function createVendor(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const company_name = str(formData.get("company_name"));
  const store_name = str(formData.get("store_name"));
  if (!company_name && !store_name)
    return { ok: false, error: "Company or store name is required." };

  const approvedRaw = formData.get("is_approved");
  const is_approved = approvedRaw === null ? true : approvedRaw === "on" || approvedRaw === "true";

  const { error } = await supabaseAdmin.from("vendors").insert({
    company_name: company_name ?? store_name,
    store_name: store_name ?? company_name,
    contact_person: str(formData.get("contact_person")),
    contact_email: str(formData.get("contact_email")),
    contact_phone: str(formData.get("contact_phone")),
    city: str(formData.get("city")),
    state: str(formData.get("state")),
    gstin: str(formData.get("gstin")),
    fssai_license_no: str(formData.get("fssai_license_no")),
    fssai_expiry: str(formData.get("fssai_expiry")),
    is_approved,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  return { ok: true };
}

/** Admin adds a product on behalf of a chosen vendor. */
export async function adminCreateProduct(
  formData: FormData
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const vendor_id = str(formData.get("vendor_id"));
  if (!vendor_id) return { ok: false, error: "Choose a vendor." };

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { error } = await supabaseAdmin.from("products").insert({
    vendor_id,
    ...parsed.values,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

/** Admin edits any product (full field control). */
export async function adminUpdateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const values: Record<string, unknown> = { ...parsed.values };
  const vendor_id = str(formData.get("vendor_id"));
  if (vendor_id) values.vendor_id = vendor_id;

  const { error } = await supabaseAdmin.from("products").update(values).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/commissions");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

/** Admin deletes any product. */
export async function adminDeleteProduct(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/commissions");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

/** Admin edits any vendor's full profile. */
export async function adminUpdateVendor(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const commissionRaw = formData.get("commission_pct");
  const commission_pct =
    commissionRaw == null || String(commissionRaw).trim() === ""
      ? null
      : Number(commissionRaw);
  if (commission_pct != null && (commission_pct < 0 || commission_pct > 100))
    return { ok: false, error: "Commission % must be between 0 and 100." };

  const store_name = str(formData.get("store_name"));
  const company_name = str(formData.get("company_name"));
  if (!store_name && !company_name)
    return { ok: false, error: "Company or store name is required." };

  const { error } = await supabaseAdmin
    .from("vendors")
    .update({
      store_name,
      company_name,
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
      commission_pct,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/commissions");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

/** Admin deletes a vendor (and its products). */
export async function adminDeleteVendor(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  await supabaseAdmin.from("products").delete().eq("vendor_id", id);
  const { error } = await supabaseAdmin.from("vendors").delete().eq("id", id);
  if (error)
    return {
      ok: false,
      error:
        "Could not delete vendor — they may have past orders. Revoke approval instead.",
    };

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/commissions");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

/** Set the platform-wide default commission %. */
export async function setPlatformCommission(pct: number): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!Number.isFinite(pct) || pct < 0 || pct > 100)
    return { ok: false, error: "Commission % must be between 0 and 100." };

  const { error } = await supabaseAdmin
    .from("platform_settings")
    .update({ default_commission_pct: pct, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/commissions");
  return { ok: true };
}

/** Set a vendor's default commission override. */
export async function setVendorCommission(
  id: string,
  pct: number | null
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (pct != null && (!Number.isFinite(pct) || pct < 0 || pct > 100))
    return { ok: false, error: "Commission % must be between 0 and 100." };

  const { error } = await supabaseAdmin
    .from("vendors")
    .update({ commission_pct: pct })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/commissions");
  revalidatePath("/admin/vendors");
  return { ok: true };
}

/** Apply a commission % to every one of a vendor's products. */
export async function applyVendorCommissionToProducts(
  vendorId: string,
  pct: number
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!Number.isFinite(pct) || pct < 0 || pct > 100)
    return { ok: false, error: "Commission % must be between 0 and 100." };

  const { error } = await supabaseAdmin
    .from("products")
    .update({ commission_pct: pct })
    .eq("vendor_id", vendorId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/commissions");
  return { ok: true };
}

/**
 * Finds an existing auth user by email (service role). Supabase has no direct
 * get-by-email admin call, so we scan the first page of users (fine for the
 * current scale).
 */
async function findAuthUserByEmail(email: string) {
  const { data } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const lower = email.toLowerCase();
  return data?.users.find((u) => (u.email ?? "").toLowerCase() === lower) ?? null;
}

/**
 * On approval, provision the vendor's login: create (invite) a Supabase auth
 * user for their registered email and email them a secure link to set their
 * own password. Links vendors.user_id to the account. Idempotent — skips if
 * the vendor is already linked.
 */
async function provisionVendorAccount(vendor: {
  id: string;
  contact_email: string | null;
  company_name: string | null;
  store_name: string | null;
  user_id: string | null;
}): Promise<string> {
  const email = (vendor.contact_email ?? "").trim();
  if (!email) {
    return "Approved. No contact email on file, so no vendor login was created.";
  }
  if (vendor.user_id) {
    return "Approved. This vendor already has a login.";
  }

  const fullName = vendor.store_name || vendor.company_name || "Vendor";
  const redirectTo = `${SITE_URL}/vendor/activate`;

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { role: "vendor", vendor_id: vendor.id, full_name: fullName },
      redirectTo,
    }
  );

  if (!error && data?.user) {
    await supabaseAdmin
      .from("vendors")
      .update({ user_id: data.user.id })
      .eq("id", vendor.id);
    return `Approved. A set-password invite was emailed to ${email}.`;
  }

  // Most common failure: an account already exists for this email.
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    await supabaseAdmin
      .from("vendors")
      .update({ user_id: existing.id })
      .eq("id", vendor.id);
    return `Approved and linked to the existing account for ${email}. They can sign in, or use "Forgot password" to set a new one.`;
  }

  return `Approved, but the invite email could not be sent (${
    error?.message ?? "unknown error"
  }). You can retry, or create the login manually.`;
}

export async function setVendorApproval(
  id: string,
  approved: boolean
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  // Read current state so we can provision a login on the approve transition.
  const { data: vendor } = await supabaseAdmin
    .from("vendors")
    .select("id, contact_email, company_name, store_name, user_id, is_approved")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("vendors")
    .update({ is_approved: approved })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  let message: string | undefined;
  if (approved && vendor) {
    message = await provisionVendorAccount(vendor);
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  return { ok: true, message };
}

export async function setProductActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * Vendor acquisition CRM (leads)
 * ------------------------------------------------------------------ */

const LEAD_STAGES = ["LEAD", "CONTACTED", "ONBOARDING", "LIVE", "LOST"];

function leadFields(formData: FormData) {
  const rawStage = String(formData.get("stage") ?? "LEAD").trim().toUpperCase();
  return {
    company_name: str(formData.get("company_name")),
    contact_name: str(formData.get("contact_name")),
    contact_email: str(formData.get("contact_email")),
    contact_phone: str(formData.get("contact_phone")),
    city: str(formData.get("city")),
    state: str(formData.get("state")),
    source: str(formData.get("source")),
    stage: LEAD_STAGES.includes(rawStage) ? rawStage : "LEAD",
    notes: str(formData.get("notes")),
  };
}

export async function adminCreateLead(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const fields = leadFields(formData);
  if (!fields.company_name)
    return { ok: false, error: "Company name is required." };

  const { error } = await supabaseAdmin.from("vendor_leads").insert(fields);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function adminUpdateLead(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const fields = leadFields(formData);
  if (!fields.company_name)
    return { ok: false, error: "Company name is required." };

  const { error } = await supabaseAdmin
    .from("vendor_leads")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function adminSetLeadStage(
  id: string,
  stage: string
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const s = String(stage).trim().toUpperCase();
  if (!LEAD_STAGES.includes(s)) return { ok: false, error: "Invalid stage." };

  const { error } = await supabaseAdmin
    .from("vendor_leads")
    .update({ stage: s, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function adminDeleteLead(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { error } = await supabaseAdmin.from("vendor_leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}
