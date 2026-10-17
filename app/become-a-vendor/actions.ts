"use server";

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export interface EnquiryResult {
  ok: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

/**
 * Public "Become a vendor" enquiry. Creates a vendor_lead (stage LEAD) that the
 * acquisition team can pick up, call and convert. Runs with the service-role
 * client so the public form can insert without a broad anon policy.
 */
export async function submitEnquiry(formData: FormData): Promise<EnquiryResult> {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, error: "Server is not configured. Please try again later." };
  }

  const company_name = str(formData.get("company_name"));
  const contact_name = str(formData.get("contact_name"));
  const contact_phone = str(formData.get("contact_phone"));

  if (!company_name) return { ok: false, error: "Please enter your company or brand name." };
  if (!contact_phone && !str(formData.get("contact_email")))
    return { ok: false, error: "Please share a phone number or email so we can reach you." };

  const { error } = await supabaseAdmin.from("vendor_leads").insert({
    company_name,
    contact_name,
    contact_email: str(formData.get("contact_email")),
    contact_phone,
    city: str(formData.get("city")),
    state: str(formData.get("state")),
    product_category: str(formData.get("product_category")),
    message: str(formData.get("message")),
    source: "Public enquiry",
    stage: "LEAD",
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
