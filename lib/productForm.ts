import { parseAttributes, type DiscountType } from "./pricing";

/** Coerce a form value to a number or null. */
export function num(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Shared product form parser used by both the vendor and admin create/update
 * actions. Kept in a plain module (not a "use server" file) so it can be
 * imported by multiple server-action modules.
 */
export function parseProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const price = num(formData.get("price"));
  const commission_pct = num(formData.get("commission_pct"));
  const stock = num(formData.get("stock"));
  const weight_gms = num(formData.get("weight_gms"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const ingredients = String(formData.get("ingredients") ?? "").trim() || null;
  const lab_tested_url =
    String(formData.get("lab_tested_url") ?? "").trim() || null;

  const rawCoa = String(formData.get("coa_status") ?? "").trim();
  const coa_status =
    rawCoa === "VENDOR_PROVIDED" ||
    rawCoa === "NUTRAATOZ_REVIEWED" ||
    rawCoa === "INDEPENDENTLY_TESTED"
      ? rawCoa
      : null;
  const coa_lab = String(formData.get("coa_lab") ?? "").trim() || null;
  const coa_batch = String(formData.get("coa_batch") ?? "").trim() || null;
  const coa_date = String(formData.get("coa_date") ?? "").trim() || null;

  const rawType = String(formData.get("discount_type") ?? "").trim();
  const discount_type: DiscountType =
    rawType === "PCT" || rawType === "FLAT" ? rawType : null;
  let discount_value = discount_type ? num(formData.get("discount_value")) : null;
  const attributes = parseAttributes(
    formData.get("attributes") ? String(formData.get("attributes")) : "[]"
  );

  // Wellness goals — a JSON array of goal slugs.
  let goals: string[] = [];
  const rawGoals = formData.get("goals");
  if (rawGoals) {
    try {
      const parsed = JSON.parse(String(rawGoals));
      if (Array.isArray(parsed)) {
        goals = parsed.filter((g): g is string => typeof g === "string");
      }
    } catch {
      goals = [];
    }
  }

  if (title.length < 2) return { error: "Title is required." as const };
  if (price == null || price < 0)
    return { error: "Enter a valid price." as const };
  if (commission_pct != null && (commission_pct < 0 || commission_pct > 100))
    return { error: "Commission % must be between 0 and 100." as const };
  if (
    discount_type === "PCT" &&
    discount_value != null &&
    (discount_value < 0 || discount_value > 100)
  )
    return { error: "Percentage discount must be between 0 and 100." as const };
  if (discount_type === "FLAT" && discount_value != null && discount_value > price)
    return { error: "Flat discount cannot exceed the price." as const };
  if (discount_value != null && discount_value <= 0) discount_value = null;

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
      coa_status,
      coa_lab,
      coa_batch,
      coa_date,
      discount_type: discount_value == null ? null : discount_type,
      discount_value,
      attributes,
      goals,
    },
  };
}
