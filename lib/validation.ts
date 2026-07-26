import { z } from "zod";

/* ------------------------------------------------------------------ *
 * Indian statutory-format validators
 * ------------------------------------------------------------------ */

/** PAN — 10 chars, AAAAA9999A */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PAN_HOLDER_TYPES = new Set([
  "P", "C", "H", "F", "A", "T", "B", "L", "J", "G", "K",
]);
export function isValidPAN(value: string): boolean {
  const v = value.toUpperCase();
  if (!PAN_REGEX.test(v)) return false;
  return PAN_HOLDER_TYPES.has(v[3]);
}

/** GSTIN — 15 chars, 22AAAAA0000A1Z5 */
export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const GSTIN_CODE_POINT_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function isValidGSTINChecksum(gstin: string): boolean {
  const v = gstin.toUpperCase();
  if (v.length !== 15) return false;
  let factor = 2;
  let sum = 0;
  const mod = GSTIN_CODE_POINT_CHARS.length;
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
export function isValidGSTIN(value: string): boolean {
  const v = value.toUpperCase();
  if (!GSTIN_REGEX.test(v)) return false;
  if (!isValidPAN(v.slice(2, 12))) return false;
  return isValidGSTINChecksum(v);
}

/** FSSAI — exactly 14 digits, leading digit 1 or 2 */
export const FSSAI_REGEX = /^[12][0-9]{13}$/;
export function isValidFSSAI(value: string): boolean {
  return FSSAI_REGEX.test(value.trim());
}

/** IFSC — 4 letters + 0 + 6 alphanumeric */
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** IEC (DGFT Import-Export Code) — now PAN-based, 10 alphanumeric */
export const IEC_REGEX = /^[A-Za-z0-9]{10}$/;

/** CIN — 21 chars (companies) */
export const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

/* ------------------------------------------------------------------ *
 * Domain option lists
 * ------------------------------------------------------------------ */

export const BUSINESS_TYPES = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Public Limited",
] as const;

export const VENDOR_ROLES = [
  "Manufacturer",
  "Brand Owner",
  "Trader / Reseller",
  "Importer",
] as const;

export const FSSAI_LICENSE_TYPES = [
  "Basic Registration",
  "State License",
  "Central License",
] as const;

export const PRODUCT_CATEGORIES = [
  "Vitamins & Minerals",
  "Herbal & Ayurvedic",
  "Protein & Sports Nutrition",
  "Probiotics & Gut Health",
  "Omega & Fish Oil",
  "Immunity & Wellness",
  "Weight Management",
  "Skin, Hair & Beauty",
] as const;

const COMPANY_TYPES = new Set(["Private Limited", "Public Limited"]);

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
 * Field-level schemas
 * ------------------------------------------------------------------ */

const indianPhone = /^[6-9][0-9]{9}$/;
const pincode = /^[1-9][0-9]{5}$/;

const upper = (s: string) => s.toUpperCase();

/* Step 1 — Business & contact */
export const businessSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(3, "Registered legal name is required")
    .max(140, "Too long"),
  brandName: z.string().trim().min(2, "Brand / store name is required").max(80),
  businessType: z.enum(BUSINESS_TYPES, {
    errorMap: () => ({ message: "Select your business type" }),
  }),
  cin: z.string().trim().optional().or(z.literal("")),
  contactPerson: z.string().trim().min(2, "Contact person is required"),
  designation: z.string().trim().min(2, "Designation is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(indianPhone, "Enter a valid 10-digit Indian mobile number"),
  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((s) => !s || /^https?:\/\/.+\..+/.test(s), {
      message: "Enter a valid URL (https://…)",
    }),
  addressLine: z.string().trim().min(5, "Registered address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(pincode, "Enter a valid 6-digit PIN code"),
});

/* Step 2 — Tax & statutory */
export const taxSchema = z.object({
  gstin: z
    .string()
    .trim()
    .transform(upper)
    .refine((s) => s.length === 15, "GSTIN must be exactly 15 characters")
    .refine((s) => GSTIN_REGEX.test(s), "GSTIN format is invalid (e.g. 22AAAAA0000A1Z5)")
    .refine((s) => isValidGSTIN(s), "GSTIN failed checksum verification"),
  pan: z
    .string()
    .trim()
    .transform(upper)
    .refine((s) => isValidPAN(s), "Enter a valid 10-character PAN (e.g. ABCDE1234F)"),
});

/* Step 3 — Nutraceutical compliance */
export const complianceSchema = z.object({
  vendorRole: z.enum(VENDOR_ROLES, {
    errorMap: () => ({ message: "Select your role" }),
  }),
  fssaiLicense: z
    .string()
    .trim()
    .refine((s) => /^[0-9]{14}$/.test(s), "FSSAI license must be exactly 14 digits")
    .refine((s) => isValidFSSAI(s), "FSSAI number must be 14 digits beginning with 1 or 2"),
  fssaiLicenseType: z.enum(FSSAI_LICENSE_TYPES, {
    errorMap: () => ({ message: "Select the FSSAI license type" }),
  }),
  fssaiExpiry: z
    .string()
    .min(1, "Select the license expiry date")
    .refine((s) => new Date(s) > new Date(), "The license has expired — enter a future date"),
  gmpCertified: z.boolean().default(false),
  iec: z
    .string()
    .trim()
    .transform(upper)
    .optional()
    .or(z.literal(""))
    .refine((s) => !s || IEC_REGEX.test(s), "IEC must be 10 characters (letters/digits)"),
  productCategories: z
    .array(z.string())
    .min(1, "Select at least one product category"),
});

/* Step 4 — Bank / payout */
export const bankSchema = z.object({
  accountHolder: z.string().trim().min(2, "Account holder name is required"),
  accountNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{9,18}$/, "Enter a valid bank account number (9–18 digits)"),
  confirmAccountNumber: z.string().trim().min(1, "Re-enter the account number"),
  ifsc: z
    .string()
    .trim()
    .transform(upper)
    .refine((s) => IFSC_REGEX.test(s), "Enter a valid IFSC code (e.g. HDFC0001234)"),
  bankName: z.string().trim().min(2, "Bank name is required"),
});

/* Step 5 — Declaration */
export const declarationSchema = z.object({
  declarationAccepted: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm the declaration to submit",
    }),
  }),
});

/* ------------------------------------------------------------------ *
 * Combined schema with cross-field rules
 * ------------------------------------------------------------------ */

export const vendorOnboardingSchema = businessSchema
  .merge(taxSchema)
  .merge(complianceSchema)
  .merge(bankSchema)
  .merge(declarationSchema)
  .superRefine((data, ctx) => {
    // CIN required (and format-checked) for incorporated companies.
    if (COMPANY_TYPES.has(data.businessType)) {
      const cin = (data.cin ?? "").toUpperCase();
      if (!cin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cin"],
          message: "CIN is required for a limited company",
        });
      } else if (!CIN_REGEX.test(cin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cin"],
          message: "Enter a valid 21-character CIN",
        });
      }
    }
    // IEC required for importers.
    if (data.vendorRole === "Importer" && !data.iec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["iec"],
        message: "Importer-Exporter Code (IEC) is required for importers",
      });
    }
    // Account numbers must match.
    if (data.accountNumber !== data.confirmAccountNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmAccountNumber"],
        message: "Account numbers do not match",
      });
    }
  });

export type VendorOnboarding = z.infer<typeof vendorOnboardingSchema>;
