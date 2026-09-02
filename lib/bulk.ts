import type { DiscountType, ProductAttribute } from "./pricing";

/** One row destined for bulk product import. */
export interface BulkImportRow {
  title: string;
  price: number;
  stock: number | null;
  weight_gms: number | null;
  discount_type: DiscountType;
  discount_value: number | null;
  description: string | null;
  ingredients: string | null;
  coa_status: string | null;
  goals: string[];
  attributes: ProductAttribute[];
}

export const CSV_HEADERS = [
  "title",
  "price",
  "stock",
  "weight_gms",
  "discount_type",
  "discount_value",
  "description",
  "ingredients",
  "coa_status",
  "goals",
  "attributes",
] as const;

/** A ready-to-edit template with one example row. */
export const CSV_TEMPLATE = `title,price,stock,weight_gms,discount_type,discount_value,description,ingredients,coa_status,goals,attributes
"Triple-Strength Omega-3",1299,100,250,PCT,10,"Ultra-pure fish oil","EPA 660mg, DHA 440mg",VENDOR_PROVIDED,heart-health|daily-essentials,"Form:Softgel | Servings:60"
`;

/* ----------------------------- CSV parsing ----------------------------- */

/** Minimal RFC-4180-ish CSV parser (handles quoted fields, commas, escaped quotes, CRLF). */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  // last field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

function toNum(v: string | undefined): number | null {
  if (v == null || v.trim() === "") return null;
  const n = Number(v.trim());
  return Number.isFinite(n) ? n : null;
}

function parseGoals(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split(/[|;]/)
    .map((g) => g.trim().toLowerCase())
    .filter(Boolean);
}

function parseAttrs(v: string | undefined): ProductAttribute[] {
  if (!v) return [];
  return v
    .split("|")
    .map((pair) => {
      const idx = pair.indexOf(":");
      if (idx === -1) return null;
      const label = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((a): a is ProductAttribute => a !== null);
}

export interface ParseResult {
  rows: BulkImportRow[];
  errors: string[];
}

/** Parse a full CSV string into validated import rows + per-row errors. */
export function parseImportCsv(text: string): ParseResult {
  const raw = parseCsvRows(text);
  const errors: string[] = [];
  if (raw.length === 0) return { rows: [], errors: ["The file is empty."] };

  const header = raw[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  if (col("title") === -1 || col("price") === -1) {
    return {
      rows: [],
      errors: ['CSV must include at least "title" and "price" columns.'],
    };
  }

  const rows: BulkImportRow[] = [];
  for (let r = 1; r < raw.length; r++) {
    const cells = raw[r];
    const get = (name: string) => {
      const c = col(name);
      return c === -1 ? undefined : cells[c];
    };
    const title = (get("title") ?? "").trim();
    const price = toNum(get("price"));
    const line = r + 1;

    if (title.length < 2) {
      errors.push(`Row ${line}: missing title.`);
      continue;
    }
    if (price == null || price < 0) {
      errors.push(`Row ${line}: invalid price.`);
      continue;
    }

    const rawType = (get("discount_type") ?? "").trim().toUpperCase();
    const discount_type: DiscountType =
      rawType === "PCT" || rawType === "FLAT" ? rawType : null;
    let discount_value = discount_type ? toNum(get("discount_value")) : null;
    if (discount_value != null && discount_value <= 0) discount_value = null;
    if (
      discount_type === "PCT" &&
      discount_value != null &&
      (discount_value < 0 || discount_value > 100)
    ) {
      errors.push(`Row ${line}: percentage discount must be 0–100.`);
      continue;
    }
    if (discount_type === "FLAT" && discount_value != null && discount_value > price) {
      errors.push(`Row ${line}: flat discount exceeds price.`);
      continue;
    }

    const rawCoa = (get("coa_status") ?? "").trim().toUpperCase();
    const coa_status =
      rawCoa === "VENDOR_PROVIDED" ||
      rawCoa === "NUTRAATOZ_REVIEWED" ||
      rawCoa === "INDEPENDENTLY_TESTED"
        ? rawCoa
        : null;

    rows.push({
      title,
      price,
      stock: toNum(get("stock")),
      weight_gms: toNum(get("weight_gms")),
      discount_type: discount_value == null ? null : discount_type,
      discount_value,
      description: (get("description") ?? "").trim() || null,
      ingredients: (get("ingredients") ?? "").trim() || null,
      coa_status,
      goals: parseGoals(get("goals")),
      attributes: parseAttrs(get("attributes")),
    });
  }

  return { rows, errors };
}

/* ----------------------------- CSV export ----------------------------- */

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export interface ExportProduct {
  title: string;
  price: number;
  stock: number | null;
  weight_gms: number | null;
  discount_type: DiscountType;
  discount_value: number | null;
  description: string | null;
  ingredients: string | null;
  coa_status?: string | null;
  goals?: string[];
  attributes: ProductAttribute[];
}

export function toCsv(products: ExportProduct[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const p of products) {
    lines.push(
      [
        esc(p.title),
        esc(p.price),
        esc(p.stock ?? ""),
        esc(p.weight_gms ?? ""),
        esc(p.discount_type ?? ""),
        esc(p.discount_value ?? ""),
        esc(p.description ?? ""),
        esc(p.ingredients ?? ""),
        esc(p.coa_status ?? ""),
        esc((p.goals ?? []).join("|")),
        esc((p.attributes ?? []).map((a) => `${a.label}:${a.value}`).join(" | ")),
      ].join(",")
    );
  }
  return lines.join("\n");
}
