"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVendorContext } from "@/lib/vendorData";
import { parseProduct } from "@/lib/productForm";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Commission is set by the platform, not the vendor. Resolve the rate that
 * applies to a vendor: their admin-assigned override, else the platform
 * default (else 15%).
 */
async function resolveCommission(vendorId: string): Promise<number> {
  const { data: vendor } = await supabaseAdmin
    .from("vendors")
    .select("commission_pct")
    .eq("id", vendorId)
    .maybeSingle();
  if (vendor?.commission_pct != null) return Number(vendor.commission_pct);

  const { data: settings } = await supabaseAdmin
    .from("platform_settings")
    .select("default_commission_pct")
    .eq("id", 1)
    .maybeSingle();
  return Number(settings?.default_commission_pct ?? 15);
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  // Vendors don't set commission — inherit the platform/admin-decided rate.
  const { commission_pct: ignoredCreate, ...values } = parsed.values;
  void ignoredCreate;
  const commission_pct = await resolveCommission(ctx.vendorId);

  const { error } = await supabaseAdmin.from("products").insert({
    vendor_id: ctx.vendorId,
    ...values,
    commission_pct,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/products");
  revalidatePath("/vendor/dashboard");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  // Never let a vendor edit commission — preserve the admin-set rate.
  const { commission_pct: _ignored, ...values } = parsed.values;

  const { error } = await supabaseAdmin
    .from("products")
    .update(values)
    .eq("id", id)
    .eq("vendor_id", ctx.vendorId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/products");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("vendor_id", ctx.vendorId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/products");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id)
    .eq("vendor_id", ctx.vendorId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/products");
  revalidatePath("/vendor/dashboard");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}
