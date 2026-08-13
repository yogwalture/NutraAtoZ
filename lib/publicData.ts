import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";
import {
  effectivePrice,
  discountLabel,
  parseAttributes,
  type ProductAttribute,
} from "./pricing";

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
      "id, title, price, weight_gms, description, stock, discount_type, discount_value, attributes, vendor_id, is_active, created_at"
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
      };
    });
}
