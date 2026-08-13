"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminContext } from "@/lib/adminData";
import { parseProduct } from "@/lib/productForm";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin(): Promise<ActionResult | null> {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return { ok: false, error: "Not authorised." };
  return null;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

/** Admin creates a vendor directly (auto-approved). */
export async function createVendor(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const company_name = str(formData.get("company_name"));
  const store_name = str(formData.get("store_name"));
  if (!company_name && !store_name)
    return { ok: false, error: "Company or store name is required." };

  const approvedRaw = formData.get("is_approved");
  const is_approved = approvedRaw === null ? true : approvedRaw === "on" || approvedRaw === "true";

  const { error } = await supabaseAdmin.from("vendors").insert({
    company_name: company_name ?? store_name,
    store_name: store_name ?? company_name,
    contact_person: str(formData.get("contact_person")),
    contact_email: str(formData.get("contact_email")),
    contact_phone: str(formData.get("contact_phone")),
    city: str(formData.get("city")),
    state: str(formData.get("state")),
    gstin: str(formData.get("gstin")),
    fssai_license_no: str(formData.get("fssai_license_no")),
    fssai_expiry: str(formData.get("fssai_expiry")),
    is_approved,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  return { ok: true };
}

/** Admin adds a product on behalf of a chosen vendor. */
export async function adminCreateProduct(
  formData: FormData
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const vendor_id = str(formData.get("vendor_id"));
  if (!vendor_id) return { ok: false, error: "Choose a vendor." };

  const parsed = parseProduct(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { error } = await supabaseAdmin.from("products").insert({
    vendor_id,
    ...parsed.values,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

export async function setVendorApproval(
  id: string,
  approved: boolean
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { error } = await supabaseAdmin
    .from("vendors")
    .update({ is_approved: approved })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setProductActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  return { ok: true };
}
