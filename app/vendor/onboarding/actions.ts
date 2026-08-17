"use server";

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { FSSAI_BUCKET } from "@/lib/supabase";
import type { VendorOnboarding } from "@/lib/validation";

/**
 * Server-side vendor onboarding. Runs with the service-role client so the
 * public self-onboarding flow can upload the FSSAI certificate and insert the
 * pending vendor row without a broad anon INSERT policy on `vendors`
 * (browser-side inserts are correctly blocked by row-level security).
 */
export async function submitVendorAction(
  formData: FormData
): Promise<{ ok: boolean; vendorId?: string; error?: string }> {
  if (!isSupabaseAdminConfigured) {
    return {
      ok: false,
      error:
        "Server storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to the environment.",
    };
  }

  const payloadRaw = formData.get("payload");
  const certificate = formData.get("certificate");

  if (typeof payloadRaw !== "string") {
    return { ok: false, error: "Missing submission data." };
  }
  if (!(certificate instanceof File) || certificate.size === 0) {
    return { ok: false, error: "Missing FSSAI certificate." };
  }

  let data: VendorOnboarding;
  try {
    data = JSON.parse(payloadRaw) as VendorOnboarding;
  } catch {
    return { ok: false, error: "Malformed submission." };
  }

  try {
    const ext = certificate.name.split(".").pop() || "bin";
    const path = `${data.gstin}/${Date.now()}-fssai.${ext}`;
    const bytes = Buffer.from(await certificate.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(FSSAI_BUCKET)
      .upload(path, bytes, {
        cacheControl: "3600",
        upsert: false,
        contentType: certificate.type || "application/octet-stream",
      });
    if (uploadError) {
      return { ok: false, error: `Certificate upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(FSSAI_BUCKET).getPublicUrl(path);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("vendors")
      .insert({
        // business & contact
        company_name: data.legalName,
        store_name: data.brandName,
        business_type: data.businessType,
        cin: data.cin || null,
        contact_person: data.contactPerson,
        designation: data.designation,
        contact_email: data.email,
        contact_phone: data.phone,
        website: data.website || null,
        address_line: data.addressLine,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        // tax
        gstin: data.gstin,
        pan: data.pan,
        // compliance
        vendor_role: data.vendorRole,
        fssai_license_no: data.fssaiLicense,
        fssai_license_type: data.fssaiLicenseType,
        fssai_expiry: data.fssaiExpiry,
        fssai_certificate_url: publicUrl,
        gmp_certified: data.gmpCertified,
        iec_code: data.iec || null,
        product_categories: data.productCategories,
        // bank / payout
        bank_account_holder: data.accountHolder,
        bank_account_number: data.accountNumber,
        bank_ifsc: data.ifsc,
        bank_name: data.bankName,
        // declaration + status
        declaration_accepted: data.declarationAccepted,
        is_approved: false,
      })
      .select("id")
      .single();

    if (insertError) {
      return { ok: false, error: `Could not save vendor: ${insertError.message}` };
    }

    return { ok: true, vendorId: inserted?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return { ok: false, error: message };
  }
}
