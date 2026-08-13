/** Discount + attribute helpers shared across storefront, cart, and dashboards. */

export type DiscountType = "PCT" | "FLAT" | null;

export interface ProductAttribute {
  label: string;
  value: string;
}

/**
 * Effective (charged) price after a percentage or flat discount, in whole
 * rupees. Never returns below 0 or above the original price.
 */
export function effectivePrice(
  price: number,
  discountType: DiscountType,
  discountValue: number | null | undefined
): number {
  const base = Number(price) || 0;
  const val = Number(discountValue) || 0;
  if (!discountType || val <= 0) return Math.round(base);
  if (discountType === "PCT") {
    const capped = Math.min(val, 100);
    return Math.max(0, Math.round(base * (1 - capped / 100)));
  }
  // FLAT
  return Math.max(0, Math.round(base - val));
}

/** Short label for a discount, e.g. "15% OFF" or "₹200 OFF". null if none. */
export function discountLabel(
  discountType: DiscountType,
  discountValue: number | null | undefined
): string | null {
  const val = Number(discountValue) || 0;
  if (!discountType || val <= 0) return null;
  if (discountType === "PCT") return `${Math.min(val, 100)}% OFF`;
  return `₹${Math.round(val)} OFF`;
}

/** Safely coerce a stored `attributes` value into a clean array. */
export function parseAttributes(raw: unknown): ProductAttribute[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((a) => {
      const rec = a as Record<string, unknown>;
      return {
        label: String(rec?.label ?? "").trim(),
        value: String(rec?.value ?? "").trim(),
      };
    })
    .filter((a) => a.label.length > 0 && a.value.length > 0)
    .slice(0, 20);
}
