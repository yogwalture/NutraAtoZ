import { supabase, isSupabaseConfigured, FSSAI_BUCKET } from "./supabase";
import type { VendorOnboarding } from "./validation";

export interface SubmitResult {
  ok: boolean;
  vendorId?: string;
  error?: string;
}

/**
 * Uploads the FSSAI certificate to Supabase Storage, then inserts a
 * pending (is_approved = false) vendor row with the full nutraceuticals
 * registration profile.
 *
 * NOTE (production): bank account details should be sent to Razorpay to
 * create a linked account and NOT stored in plaintext. They are persisted
 * here only for this scaffold — tokenize / vault them before going live.
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
