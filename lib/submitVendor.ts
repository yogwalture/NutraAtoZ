import { supabase, isSupabaseConfigured, FSSAI_BUCKET } from "./supabase";
import type { VendorOnboarding } from "./validation";

export interface SubmitResult {
  ok: boolean;
  vendorId?: string;
  error?: string;
}

/**
 * Uploads the FSSAI certificate to Supabase Storage, then inserts a
 * pending (is_approved = false) row into the `vendors` table.
 */
export async function submitVendor(
  data: VendorOnboarding,
  certificate: File
): Promise<SubmitResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable submission.",
    };
  }

  try {
    const ext = certificate.name.split(".").pop() ?? "bin";
    const path = `${data.gstin}/${Date.now()}-fssai.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(FSSAI_BUCKET)
      .upload(path, certificate, {
        cacheControl: "3600",
        upsert: false,
        contentType: certificate.type,
      });

    if (uploadError) {
      return { ok: false, error: `Certificate upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(FSSAI_BUCKET).getPublicUrl(path);

    const { data: inserted, error: insertError } = await supabase
      .from("vendors")
      .insert({
        company_name: data.companyName,
        store_name: data.storeName,
        contact_person: data.contactPerson,
        contact_email: data.email,
        contact_phone: data.phone,
        address_line: data.addressLine,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gstin: data.gstin,
        pan: data.pan,
        fssai_license_no: data.fssaiLicense,
        fssai_expiry: data.fssaiExpiry,
        fssai_certificate_url: publicUrl,
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
