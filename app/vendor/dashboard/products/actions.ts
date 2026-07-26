"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVendorContext } from "@/lib/vendorData";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function num(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const price = num(formData.get("price"));
  const commission_pct = num(formData.get("commission_pct"));
  const stock = num(formData.get("stock"));
  const weight_gms = num(formData.get("weight_gms"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const ingredients = String(formData.get("ingredients") ?? "").trim() || null;
  const lab_tested_url =
    String(formData.get("lab_tested_url") ?? "").trim() || null;

  if (title.length < 2) return { error: "Title is required." as const };
  if (price == null || price < 0)
    return { error: "Enter a valid price." as const };
  if (commission_pct != null && (commission_pct < 0 || commission_pct > 100))
    return { error: "Commission % must be between 0 and 100." as const };

  return {
    values: {
      title,
      price,
      commission_pct,
      stock,
      weight_gms,
      description,
      ingredients,
      lab_tested_url,
    },
  };
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const ctx = await getVendorContext();
  if (!ctx.vendorId) return { ok: false, error: "No vendor in session." };

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { error } = await supabaseAdmin.from("products").insert({
    vendor_id: ctx.vendorId,
    ...parsed.values,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/products");
  revalidatePath("/vendor/dashboard");
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

  const { error } = await supabaseAdmin
    .from("products")
    .update(parsed.values)
    .eq("id", id)
    .eq("vendor_id", ctx.vendorId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/vendor/dashboard/products");
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
  return { ok: true };
}
