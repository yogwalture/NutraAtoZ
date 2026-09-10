"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVendorContext } from "@/lib/vendorData";
import {
  isShiprocketConfigured,
  createPickupLocation,
  ShiprocketError,
} from "@/lib/shiprocket";

export interface ShippingResult {
  ok: boolean;
  error?: string;
  registered?: boolean;
  note?: string;
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

/**
 * Saves the vendor's pickup address and (when Shiprocket is configured)
 * registers it as a Shiprocket pickup location so shipments can dispatch from it.
 */
export async function saveAndRegisterPickup(
  formData: FormData
): Promise<ShippingResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const contact_person = str(formData.get("contact_person"));
  const contact_phone = str(formData.get("contact_phone"));
  const address_line = str(formData.get("address_line"));
  const city = str(formData.get("city"));
  const state = str(formData.get("state"));
  const pincode = str(formData.get("pincode"));

  if (!contact_person || contact_person.length < 2)
    return { ok: false, error: "Enter the pickup contact name." };
  if (!/^[6-9][0-9]{9}$/.test(contact_phone))
    return { ok: false, error: "Enter a valid 10-digit pickup phone." };
  if (!address_line || address_line.length < 5)
    return { ok: false, error: "Enter the full pickup address." };
  if (!city || !state) return { ok: false, error: "Enter city and state." };
  if (!/^[1-9][0-9]{5}$/.test(pincode))
    return { ok: false, error: "Enter a valid 6-digit pincode." };

  // Persist the address regardless of Shiprocket status.
  const update: Record<string, unknown> = {
    contact_person,
    contact_phone,
    address_line,
    city,
    state,
    pincode,
  };

  let registered = false;
  let note: string | undefined;

  if (isShiprocketConfigured) {
    const nickname =
      ctx.vendor?.shiprocket_pickup_nickname ||
      `naz_${ctx.vendorId.slice(0, 8)}`;
    try {
      await createPickupLocation({
        nickname,
        name: contact_person,
        email: ctx.vendor?.contact_email || "vendor@nutraatoz.com",
        phone: contact_phone,
        address: address_line,
        city,
        state,
        pincode,
      });
      update.shiprocket_pickup_nickname = nickname;
      update.shiprocket_pickup_registered = true;
      registered = true;
    } catch (e) {
      const msg =
        e instanceof ShiprocketError ? e.message : "Shiprocket registration failed.";
      // Save the address but report the registration problem.
      const { error } = await supabaseAdmin
        .from("vendors")
        .update(update)
        .eq("id", ctx.vendorId);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/vendor/dashboard/shipping");
      return {
        ok: true,
        registered: false,
        note: `Address saved, but Shiprocket pickup registration failed: ${msg}`,
      };
    }
  } else {
    note =
      "Address saved. Shiprocket isn't connected yet, so pickup registration is pending — it will register automatically once the platform enables shipping.";
  }

  const { error } = await supabaseAdmin
    .from("vendors")
    .update(update)
    .eq("id", ctx.vendorId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/shipping");
  revalidatePath("/vendor/dashboard");
  return { ok: true, registered, note };
}
