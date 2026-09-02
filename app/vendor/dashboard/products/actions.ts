"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVendorContext } from "@/lib/vendorData";
import { parseProduct } from "@/lib/productForm";
import type { BulkImportRow } from "@/lib/bulk";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface BulkResult extends ActionResult {
  count?: number;
}

function revalidateStore() {
  revalidatePath("/vendor/dashboard/products");
  revalidatePath("/vendor/dashboard/bulk");
  revalidatePath("/vendor/dashboard");
  revalidatePath("/");
  revalidatePath("/products");
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

  revalidateStore();
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * Bulk operations (all vendor-scoped; commission stays platform-set)
 * ------------------------------------------------------------------ */

/** Insert many products at once from validated CSV rows. */
export async function bulkImportProducts(
  rows: BulkImportRow[]
): Promise<BulkResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };
  if (!Array.isArray(rows) || rows.length === 0)
    return { ok: false, error: "Nothing to import." };
  if (rows.length > 1000)
    return { ok: false, error: "Import is limited to 1000 rows at a time." };

  const commission_pct = await resolveCommission(ctx.vendorId);
  const payload = rows.map((r) => ({
    vendor_id: ctx.vendorId,
    title: r.title,
    price: r.price,
    stock: r.stock,
    weight_gms: r.weight_gms,
    discount_type: r.discount_type,
    discount_value: r.discount_value,
    description: r.description,
    ingredients: r.ingredients,
    coa_status: r.coa_status,
    goals: r.goals ?? [],
    attributes: r.attributes ?? [],
    commission_pct,
    is_active: true,
  }));

  const { error } = await supabaseAdmin.from("products").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidateStore();
  return { ok: true, count: payload.length };
}

async function ownedIds(vendorId: string, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const { data } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("vendor_id", vendorId)
    .in("id", ids);
  return (data ?? []).map((p) => p.id);
}

export async function bulkSetActive(
  ids: string[],
  active: boolean
): Promise<BulkResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };
  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: active })
    .eq("vendor_id", ctx.vendorId)
    .in("id", ids);
  if (error) return { ok: false, error: error.message };
  revalidateStore();
  return { ok: true, count: ids.length };
}

export async function bulkDelete(ids: string[]): Promise<BulkResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("vendor_id", ctx.vendorId)
    .in("id", ids);
  if (error) return { ok: false, error: error.message };
  revalidateStore();
  return { ok: true, count: ids.length };
}

export async function bulkSetStock(
  ids: string[],
  stock: number
): Promise<BulkResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };
  const s = Math.max(0, Math.floor(Number(stock) || 0));
  const { error } = await supabaseAdmin
    .from("products")
    .update({ stock: s })
    .eq("vendor_id", ctx.vendorId)
    .in("id", ids);
  if (error) return { ok: false, error: error.message };
  revalidateStore();
  return { ok: true, count: ids.length };
}

/** Adjust price of selected products by a percentage (e.g. +10 or -15). */
export async function bulkAdjustPricePct(
  ids: string[],
  pct: number
): Promise<BulkResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };
  const factor = 1 + (Number(pct) || 0) / 100;
  if (factor <= 0) return { ok: false, error: "Invalid percentage." };

  const valid = await ownedIds(ctx.vendorId, ids);
  if (valid.length === 0) return { ok: false, error: "No products selected." };

  const { data: prods } = await supabaseAdmin
    .from("products")
    .select("id, price")
    .in("id", valid);

  for (const p of prods ?? []) {
    const next = Math.max(1, Math.round((Number(p.price) || 0) * factor));
    await supabaseAdmin.from("products").update({ price: next }).eq("id", p.id);
  }
  revalidateStore();
  return { ok: true, count: (prods ?? []).length };
}

/** Duplicate a product (same vendor), suffixing the title with "(Copy)". */
export async function duplicateProduct(id: string): Promise<BulkResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const { data: p } = await supabaseAdmin
    .from("products")
    .select(
      "title, description, price, commission_pct, stock, weight_gms, ingredients, lab_tested_url, coa_status, coa_lab, coa_batch, coa_date, discount_type, discount_value, attributes, goals"
    )
    .eq("id", id)
    .eq("vendor_id", ctx.vendorId)
    .maybeSingle();
  if (!p) return { ok: false, error: "Product not found." };

  const { error } = await supabaseAdmin.from("products").insert({
    ...p,
    title: `${p.title} (Copy)`,
    vendor_id: ctx.vendorId,
    is_active: false,
  });
  if (error) return { ok: false, error: error.message };
  revalidateStore();
  return { ok: true, count: 1 };
}
