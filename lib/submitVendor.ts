import type { VendorOnboarding } from "./validation";
import { submitVendorAction } from "@/app/vendor/onboarding/actions";

export interface SubmitResult {
  ok: boolean;
  vendorId?: string;
  error?: string;
}

/**
 * Client entry point for vendor onboarding. Packs the form data + FSSAI
 * certificate into a FormData and hands off to the server action, which
 * performs the storage upload and DB insert with the service-role client
 * (bypassing row-level security — the browser anon client cannot insert
 * into `vendors`).
 */
export async function submitVendor(
  data: VendorOnboarding,
  certificate: File
): Promise<SubmitResult> {
  try {
    const fd = new FormData();
    fd.set("payload", JSON.stringify(data));
    fd.set("certificate", certificate);
    return await submitVendorAction(fd);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submission failed.";
    return { ok: false, error: message };
  }
}
