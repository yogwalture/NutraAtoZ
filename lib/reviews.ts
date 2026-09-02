import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";
import { createSupabaseServerClient } from "./supabaseServerClient";

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  reviewerName: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  count: number;
  average: number; // 0 when no reviews
  /** counts[5..1] */
  distribution: Record<number, number>;
}

/** Has this customer purchased this product (any order)? */
async function hasPurchased(
  customerId: string,
  productId: string
): Promise<boolean> {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("customer_id", customerId);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return false;

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("id")
    .eq("product_id", productId)
    .in("order_id", orderIds)
    .limit(1);
  return !!items && items.length > 0;
}

export interface ReviewEligibility {
  signedIn: boolean;
  canReview: boolean;
  alreadyReviewed: boolean;
}

/** Determine whether the current visitor may review a product. */
export async function getReviewEligibility(
  productId: string
): Promise<ReviewEligibility> {
  if (!isSupabaseAdminConfigured)
    return { signedIn: false, canReview: false, alreadyReviewed: false };
  let userId: string | null = null;
  try {
    const supa = createSupabaseServerClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }
  if (!userId) return { signedIn: false, canReview: false, alreadyReviewed: false };

  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("customer_id", userId)
    .maybeSingle();
  if (existing) return { signedIn: true, canReview: true, alreadyReviewed: true };

  const purchased = await hasPurchased(userId, productId);
  return { signedIn: true, canReview: purchased, alreadyReviewed: false };
}

/** Published reviews for a product, newest first. */
export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseAdminConfigured) return [];
  const { data } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, title, body, reviewer_name, verified_purchase, created_at")
    .eq("product_id", productId)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((r) => ({
    id: r.id,
    rating: Number(r.rating) || 0,
    title: r.title ?? null,
    body: r.body ?? null,
    reviewerName: r.reviewer_name || "Verified buyer",
    verifiedPurchase: r.verified_purchase !== false,
    createdAt: r.created_at,
  }));
}

export async function getReviewSummary(
  productId: string
): Promise<ReviewSummary> {
  const empty: ReviewSummary = {
    count: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
  if (!isSupabaseAdminConfigured) return empty;

  const { data } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "PUBLISHED");

  if (!data || data.length === 0) return empty;
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
  let sum = 0;
  for (const r of data) {
    const n = Number(r.rating) || 0;
    sum += n;
    if (dist[n] != null) dist[n] += 1;
  }
  return {
    count: data.length,
    average: Math.round((sum / data.length) * 10) / 10,
    distribution: dist,
  };
}
