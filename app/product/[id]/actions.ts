"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export interface ReviewResult {
  ok: boolean;
  error?: string;
}

/**
 * Submit (or update) a verified-purchase review. Enforced server-side:
 *  - the visitor must be signed in, and
 *  - must have an order containing this product.
 * One review per customer per product (upsert).
 */
export async function submitReview(
  productId: string,
  rating: number,
  title: string,
  body: string
): Promise<ReviewResult> {
  if (!isSupabaseAdminConfigured)
    return { ok: false, error: "Store backend is not configured yet." };

  const r = Math.round(Number(rating));
  if (!Number.isFinite(r) || r < 1 || r > 5)
    return { ok: false, error: "Please choose a rating from 1 to 5." };

  let userId: string | null = null;
  let email: string | null = null;
  try {
    const supa = createSupabaseServerClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    userId = user?.id ?? null;
    email = user?.email ?? null;
  } catch {
    userId = null;
  }
  if (!userId)
    return { ok: false, error: "Please sign in to write a review." };

  // Verify the customer purchased this product.
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("customer_id", userId);
  const orderIds = (orders ?? []).map((o) => o.id);
  let purchased = false;
  if (orderIds.length > 0) {
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("id")
      .eq("product_id", productId)
      .in("order_id", orderIds)
      .limit(1);
    purchased = !!items && items.length > 0;
  }
  if (!purchased)
    return {
      ok: false,
      error: "Only verified purchasers can review this product.",
    };

  // Reviewer display name from profile, else a neutral fallback.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const reviewerName =
    (profile?.full_name && String(profile.full_name).trim()) ||
    (email ? email.split("@")[0] : "Verified buyer");

  const { error } = await supabaseAdmin.from("reviews").upsert(
    {
      product_id: productId,
      customer_id: userId,
      rating: r,
      title: title.trim() ? title.trim().slice(0, 120) : null,
      body: body.trim() ? body.trim().slice(0, 2000) : null,
      reviewer_name: reviewerName,
      verified_purchase: true,
      status: "PUBLISHED",
    },
    { onConflict: "product_id,customer_id" }
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/product/${productId}`);
  return { ok: true };
}
