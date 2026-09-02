import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";
import {
  effectivePrice,
  discountLabel,
  parseAttributes,
  type ProductAttribute,
} from "./pricing";
import { GOALS, getGoal, textMatchesGoal } from "./goals";

export interface StoreProduct {
  id: string;
  title: string;
  brand: string;
  /** Charged price after discount (whole rupees). */
  price: number;
  /** Original price (MRP) before discount; equals price when no discount. */
  mrp: number;
  /** e.g. "15% OFF" or "₹200 OFF"; null when no discount. */
  discount: string | null;
  weight_gms: number | null;
  description: string | null;
  stock: number | null;
  attributes: ProductAttribute[];
  /** Vendor/admin-assigned wellness-goal slugs. */
  goals: string[];
}

export type CoaStatus =
  | "VENDOR_PROVIDED"
  | "NUTRAATOZ_REVIEWED"
  | "INDEPENDENTLY_TESTED"
  | null;

export interface StoreProductDetail extends StoreProduct {
  ingredients: string | null;
  coaUrl: string | null;
  coaStatus: CoaStatus;
  coaLab: string | null;
  coaBatch: string | null;
  coaDate: string | null;
  vendorId: string;
  vendorApproved: boolean;
}

const DETAIL_SELECT =
  "id, title, price, weight_gms, description, ingredients, stock, discount_type, discount_value, attributes, lab_tested_url, coa_status, coa_lab, coa_batch, coa_date, vendor_id, is_active";

function coerceCoa(s: unknown): CoaStatus {
  return s === "VENDOR_PROVIDED" ||
    s === "NUTRAATOZ_REVIEWED" ||
    s === "INDEPENDENTLY_TESTED"
    ? s
    : null;
}

/** Full detail for one active product (with brand + CoA). null if unavailable. */
export async function getStoreProductById(
  id: string
): Promise<StoreProductDetail | null> {
  if (!isSupabaseAdminConfigured) return null;

  const { data: p } = await supabaseAdmin
    .from("products")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (!p) return null;

  const { data: vendor } = await supabaseAdmin
    .from("vendors")
    .select("id, store_name, company_name, is_approved")
    .eq("id", p.vendor_id)
    .maybeSingle();
  if (!vendor || vendor.is_approved === false) return null;

  const mrp = Number(p.price) || 0;
  const discountType =
    p.discount_type === "PCT" || p.discount_type === "FLAT"
      ? p.discount_type
      : null;
  const price = effectivePrice(mrp, discountType, p.discount_value);

  return {
    id: p.id,
    title: p.title,
    brand: vendor.store_name || vendor.company_name || "Nutraatoz",
    price,
    mrp,
    discount: discountLabel(discountType, p.discount_value),
    weight_gms: p.weight_gms,
    description: p.description,
    stock: p.stock,
    attributes: parseAttributes(p.attributes),
    ingredients: p.ingredients ?? null,
    coaUrl: p.lab_tested_url ?? null,
    coaStatus: coerceCoa(p.coa_status),
    coaLab: p.coa_lab ?? null,
    coaBatch: p.coa_batch ?? null,
    coaDate: p.coa_date ?? null,
    vendorId: p.vendor_id,
    vendorApproved: vendor.is_approved !== false,
  };
}

/** Other active products from the same vendor (for the product page). */
export async function getMoreFromVendor(
  vendorId: string,
  excludeId: string,
  limit = 4
): Promise<StoreProduct[]> {
  const all = await getStoreProducts(60);
  return all.filter((p) => p.id !== excludeId).slice(0, limit);
}

/**
 * Active products for the storefront (with the vendor's brand name).
 * Returns [] when Supabase isn't configured so the page still renders.
 */
export async function getStoreProducts(limit = 12): Promise<StoreProduct[]> {
  if (!isSupabaseAdminConfigured) return [];

  const { data: products } = await supabaseAdmin
    .from("products")
    .select(
      "id, title, price, weight_gms, description, stock, discount_type, discount_value, attributes, goals, vendor_id, is_active, created_at"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!products || products.length === 0) return [];

  const vendorIds = Array.from(new Set(products.map((p) => p.vendor_id)));
  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select("id, store_name, company_name, is_approved")
    .in("id", vendorIds);

  const brandById = new Map(
    (vendors ?? [])
      .filter((v) => v.is_approved !== false)
      .map((v) => [v.id, v.store_name || v.company_name || "Nutraatoz"])
  );

  return products
    .filter((p) => brandById.has(p.vendor_id))
    .map((p) => {
      const mrp = Number(p.price) || 0;
      const discountType =
        p.discount_type === "PCT" || p.discount_type === "FLAT"
          ? p.discount_type
          : null;
      const price = effectivePrice(mrp, discountType, p.discount_value);
      return {
        id: p.id,
        title: p.title,
        brand: brandById.get(p.vendor_id) ?? "Nutraatoz",
        price,
        mrp,
        discount: discountLabel(discountType, p.discount_value),
        weight_gms: p.weight_gms,
        description: p.description,
        stock: p.stock,
        attributes: parseAttributes(p.attributes),
        goals: Array.isArray(p.goals) ? (p.goals as string[]) : [],
      };
    });
}

/** Searchable text blob for a product, used by the goal keyword fallback. */
function goalHaystack(p: StoreProduct): string {
  return [
    p.title,
    p.brand,
    p.description ?? "",
    p.attributes.map((a) => `${a.label} ${a.value}`).join(" "),
  ].join(" ");
}

/** Does a product belong to a goal — by explicit tag first, else keywords. */
function productInGoal(p: StoreProduct, slug: string): boolean {
  if (p.goals.includes(slug)) return true;
  const goal = getGoal(slug);
  if (!goal) return false;
  return textMatchesGoal(goalHaystack(p), goal);
}

/** Active products matched to a wellness goal (explicit tags + keyword fallback). */
export async function getProductsByGoal(slug: string): Promise<StoreProduct[]> {
  if (!getGoal(slug)) return [];
  const all = await getStoreProducts(300);
  return all.filter((p) => productInGoal(p, slug));
}

/** Map of goal slug -> number of matching active products. */
export async function getGoalCounts(): Promise<Record<string, number>> {
  const all = await getStoreProducts(300);
  const counts: Record<string, number> = {};
  for (const goal of GOALS) {
    counts[goal.slug] = all.filter((p) => productInGoal(p, goal.slug)).length;
  }
  return counts;
}
