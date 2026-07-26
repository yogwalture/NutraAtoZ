import { z } from "zod";

/* ------------------------------------------------------------------ *
 * Indian statutory-format validators
 * ------------------------------------------------------------------ */

/**
 * PAN — Permanent Account Number (10 chars). Format: AAAAA9999A
 */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Valid 4th-character holder types per the Income Tax Dept. */
const PAN_HOLDER_TYPES = new Set([
  "P", "C", "H", "F", "A", "T", "B", "L", "J", "G", "K",
]);

export function isValidPAN(value: string): boolean {
  const v = value.toUpperCase();
  if (!PAN_REGEX.test(v)) return false;
  return PAN_HOLDER_TYPES.has(v[3]);
}

/**
 * GSTIN — Goods & Services Tax Identification Number (15 chars).
 * Format: 22AAAAA0000A1Z5
 */
export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GSTIN_CODE_POINT_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Validates the GSTIN's 15th-character checksum using the official
 * modulo-36 algorithm.
 */
export function isValidGSTINChecksum(gstin: string): boolean {
  const v = gstin.toUpperCase();
  if (v.length !== 15) return false;

  let factor = 2;
  let sum = 0;
  const mod = GSTIN_CODE_POINT_CHARS.length; // 36

  for (let i = 13; i >= 0; i--) {
    const codePoint = GSTIN_CODE_POINT_CHARS.indexOf(v[i]);
    if (codePoint === -1) return false;
    let digit = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    digit = Math.floor(digit / mod) + (digit % mod);
    sum += digit;
  }

  const checkCodePoint = (mod - (sum % mod)) % mod;
  return GSTIN_CODE_POINT_CHARS[checkCodePoint] === v[14];
}

/** Full GSTIN validation: format + embedded PAN + checksum. */
export function isValidGSTIN(value: string): boolean {
  const v = value.toUpperCase();
  if (!GSTIN_REGEX.test(v)) return false;
  if (!isValidPAN(v.slice(2, 12))) return false;
  return isValidGSTINChecksum(v);
}

/**
 * FSSAI License Number — strictly 14 digits, leading digit 1 or 2.
 */
export const FSSAI_REGEX = /^[12][0-9]{13}$/;

export function isValidFSSAI(value: string): boolean {
  return FSSAI_REGEX.test(value.trim());
}

/* ------------------------------------------------------------------ *
 * File / image validation
 * ------------------------------------------------------------------ */

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ------------------------------------------------------------------ *
 * Zod schemas — one per step + the combined schema
 * ------------------------------------------------------------------ */

const indianPhone = /^[6-9][0-9]{9}$/;
const pincode = /^[1-9][0-9]{5}$/;

export const storeDetailsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(3, "Company name must be at least 3 characters")
    .max(120, "Company name is too long"),
  storeName: z
    .string()
    .trim()
    .min(2, "Store display name is required")
    .max(80, "Store name is too long"),
  contactPerson: z.string().trim().min(2, "Contact person is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(indianPhone, "Enter a valid 10-digit Indian mobile number"),
  addressLine: z.string().trim().min(5, "Registered address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(pincode, "Enter a valid 6-digit PIN code"),
});

export const taxDetailsSchema = z.object({
  gstin: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .refine((s) => s.length === 15, {
      message: "GSTIN must be exactly 15 characters",
    })
    .refine((s) => GSTIN_REGEX.test(s), {
      message: "GSTIN format is invalid (e.g. 22AAAAA0000A1Z5)",
    })
    .refine((s) => isValidGSTIN(s), {
      message: "GSTIN failed checksum verification — please re-check the number",
    }),
  pan: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .refine((s) => isValidPAN(s), {
      message: "Enter a valid 10-character PAN (e.g. ABCDE1234F)",
    }),
});

export const complianceSchema = z.object({
  fssaiLicense: z
    .string()
    .trim()
    .refine((s) => /^[0-9]{14}$/.test(s), {
      message: "FSSAI license must be exactly 14 digits",
    })
    .refine((s) => isValidFSSAI(s), {
      message: "FSSAI number must be 14 digits beginning with 1 or 2",
    }),
  fssaiExpiry: z
    .string()
    .min(1, "Select the license expiry date")
    .refine((s) => new Date(s) > new Date(), {
      message: "The license has expired — enter a future expiry date",
    }),
});

export const vendorOnboardingSchema = storeDetailsSchema
  .merge(taxDetailsSchema)
  .merge(complianceSchema);

export type StoreDetails = z.infer<typeof storeDetailsSchema>;
export type TaxDetails = z.infer<typeof taxDetailsSchema>;
export type ComplianceDetails = z.infer<typeof complianceSchema>;
export type VendorOnboarding = z.infer<typeof vendorOnboardingSchema>;
