"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVendorContext } from "@/lib/vendorData";
import { parseProduct } from "@/lib/productForm";

export interface ActionResult {
  ok: boolean;
  error?: string;
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

  const { error } = await supabaseAdmin
    .from("products")
    .update(parsed.values)
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
