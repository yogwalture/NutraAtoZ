"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminContext } from "@/lib/adminData";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin(): Promise<ActionResult | null> {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return { ok: false, error: "Not authorised." };
  return null;
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
