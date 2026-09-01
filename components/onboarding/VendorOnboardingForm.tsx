"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  ReceiptText,
  ShieldCheck,
  Landmark,
  ClipboardCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  PartyPopper,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Field from "./Field";
import CertificateUpload from "./CertificateUpload";
import {
  vendorOnboardingSchema,
  BUSINESS_TYPES,
  VENDOR_ROLES,
  FSSAI_LICENSE_TYPES,
  PRODUCT_CATEGORIES,
  type VendorOnboarding,
} from "@/lib/validation";
import { submitVendor } from "@/lib/submitVendor";

type FieldName = keyof VendorOnboarding;

const STEPS: {
  title: string;
  short: string;
  description: string;
  icon: typeof Building2;
  fields: FieldName[];
}[] = [
  {
    title: "Business & Contact",
    short: "Business",
    description: "Your registered entity, brand, and how to reach you.",
    icon: Building2,
    fields: [
      "legalName",
      "brandName",
      "businessType",
      "cin",
      "contactPerson",
      "designation",
      "email",
      "phone",
      "website",
      "addressLine",
      "city",
      "state",
      "pincode",
    ],
  },
  {
    title: "Tax & Statutory",
    short: "Tax",
    description: "GSTIN and PAN, verified against Indian formats.",
    icon: ReceiptText,
    fields: ["gstin", "pan"],
  },
  {
    title: "Nutraceutical Compliance",
    short: "Compliance",
    description: "FSSAI licensing, quality certifications, and what you sell.",
    icon: ShieldCheck,
    fields: [
      "vendorRole",
      "fssaiLicense",
      "fssaiLicenseType",
      "fssaiExpiry",
      "gmpCertified",
      "iec",
      "productCategories",
    ],
  },
  {
    title: "Bank & Payouts",
    short: "Payouts",
    description: "Where your Razorpay settlements are deposited.",
    icon: Landmark,
    fields: [
      "accountHolder",
      "accountNumber",
      "confirmAccountNumber",
      "ifsc",
      "bankName",
    ],
  },
  {
    title: "Review & Declaration",
    short: "Review",
    description: "Confirm everything is accurate and compliant.",
    icon: ClipboardCheck,
    fields: ["declarationAccepted"],
  },
];

export default function VendorOnboardingForm() {
  const [step, setStep] = React.useState(0);
  const [certificate, setCertificate] = React.useState<File | null>(null);
  const [certError, setCertError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>();
  const [done, setDone] = React.useState(false);

  const {
    register,
    trigger,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorOnboarding>({
    resolver: zodResolver(vendorOnboardingSchema),
    mode: "onTouched",
    defaultValues: {
      productCategories: [],
      gmpCertified: false,
      declarationAccepted: false as unknown as true,
    },
  });

  const businessType = watch("businessType");
  const vendorRole = watch("vendorRole");
  const selectedCats = (watch("productCategories") ?? []) as string[];
  const isCompany =
    businessType === "Private Limited" || businessType === "Public Limited";
  const isImporter = vendorRole === "Importer";

  const isLast = step === STEPS.length - 1;

  function toggleCategory(cat: string) {
    const next = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    setValue("productCategories", next, {
      shouldValidate: true,
      shouldTouch: true,
    });
  }

  async function next() {
    if (step === 2 && !certificate) {
      setCertError("Please upload your FSSAI certificate to continue.");
    }
    const valid = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (step === 2 && !certificate) return;
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setSubmitError(undefined);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onValid(data: VendorOnboarding) {
    setSubmitError(undefined);
    if (!certificate) {
      setCertError("Please upload your FSSAI certificate.");
      setStep(2);
      return;
    }
    setSubmitting(true);
    const result = await submitVendor(data, certificate);
    setSubmitting(false);
    if (result.ok) setDone(true);
    else setSubmitError(result.error ?? "Submission failed. Please try again.");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl animate-fade-up rounded-[2rem] border border-white/60 bg-white/70 p-10 text-center shadow-float backdrop-blur-xl">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary shadow-glow-emerald">
          <PartyPopper className="h-8 w-8" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-primary">
          Application submitted!
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for applying to sell on Nutraatoz. Our team will verify your
          GSTIN, FSSAI license and bank details, and email you once your store
          is approved.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
          <p className="font-semibold text-foreground">Next step: create your vendor login</p>
          <p className="mt-1 text-muted-foreground">
            Set up a login with the <strong>same email</strong> you used above.
            Your application links to it automatically, so you can track approval
            and manage your store.
          </p>
          <a
            href="/vendor/login"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
          >
            Create vendor login
          </a>
        </div>
      </div>
    );
  }

  const ActiveIcon = STEPS[step].icon;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isComplete = i < step;
          const isActive = i === step;
          return (
            <li key={s.short} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={[
                    "grid h-11 w-11 place-items-center rounded-full border-2 transition-all",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground shadow-glow-emerald"
                      : isActive
                        ? "scale-110 border-primary bg-white text-primary shadow-glow-emerald"
                        : "border-white/70 bg-white/50 text-muted-foreground backdrop-blur",
                  ].join(" ")}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </span>
                <span
                  className={[
                    "hidden text-[11px] font-medium sm:block",
                    isActive || isComplete
                      ? "text-primary"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {s.short}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    "mx-1.5 h-0.5 flex-1 rounded-full transition-colors sm:mx-2",
                    i < step ? "bg-primary" : "bg-white/60",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/70 shadow-float backdrop-blur-xl">
        <div className="border-b border-white/50 p-6">
          <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <ActiveIcon className="h-4 w-4" />
            Step {step + 1} of {STEPS.length}
          </span>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-primary">
            {STEPS[step].title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {STEPS[step].description}
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onValid)} noValidate>
            {/* ---------- Step 1: Business ---------- */}
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Registered legal name"
                  htmlFor="legalName"
                  required
                  error={errors.legalName?.message}
                  className="sm:col-span-2"
                >
                  <Input id="legalName" placeholder="Acme Wellness Pvt. Ltd." invalid={!!errors.legalName} {...register("legalName")} />
                </Field>

                <Field label="Brand / store name" htmlFor="brandName" required error={errors.brandName?.message}>
                  <Input id="brandName" placeholder="Acme Wellness" invalid={!!errors.brandName} {...register("brandName")} />
                </Field>

                <Field label="Business type" htmlFor="businessType" required error={errors.businessType?.message}>
                  <Select id="businessType" invalid={!!errors.businessType} defaultValue="" {...register("businessType")}>
                    <option value="" disabled>Select type…</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="CIN"
                  htmlFor="cin"
                  required={isCompany}
                  error={errors.cin?.message}
                  hint={isCompany ? "21-char company identification number" : "Optional for non-companies"}
                  className="sm:col-span-2"
                >
                  <Input id="cin" placeholder="U15490MH2020PTC123456" className="font-mono uppercase" invalid={!!errors.cin} {...register("cin")} />
                </Field>

                <Field label="Contact person" htmlFor="contactPerson" required error={errors.contactPerson?.message}>
                  <Input id="contactPerson" placeholder="Priya Sharma" invalid={!!errors.contactPerson} {...register("contactPerson")} />
                </Field>

                <Field label="Designation" htmlFor="designation" required error={errors.designation?.message}>
                  <Input id="designation" placeholder="Director / Owner" invalid={!!errors.designation} {...register("designation")} />
                </Field>

                <Field label="Business email" htmlFor="email" required error={errors.email?.message}>
                  <Input id="email" type="email" placeholder="vendor@acme.in" invalid={!!errors.email} {...register("email")} />
                </Field>

                <Field label="Mobile number" htmlFor="phone" required error={errors.phone?.message} hint="10-digit Indian mobile">
                  <Input id="phone" inputMode="numeric" maxLength={10} placeholder="9876543210" invalid={!!errors.phone} {...register("phone")} />
                </Field>

                <Field label="Website" htmlFor="website" error={errors.website?.message} hint="Optional" className="sm:col-span-2">
                  <Input id="website" placeholder="https://acmewellness.in" invalid={!!errors.website} {...register("website")} />
                </Field>

                <Field label="Registered address" htmlFor="addressLine" required error={errors.addressLine?.message} className="sm:col-span-2">
                  <Input id="addressLine" placeholder="Plot 14, MIDC Industrial Area" invalid={!!errors.addressLine} {...register("addressLine")} />
                </Field>

                <Field label="City" htmlFor="city" required error={errors.city?.message}>
                  <Input id="city" placeholder="Pune" invalid={!!errors.city} {...register("city")} />
                </Field>
                <Field label="State" htmlFor="state" required error={errors.state?.message}>
                  <Input id="state" placeholder="Maharashtra" invalid={!!errors.state} {...register("state")} />
                </Field>
                <Field label="PIN code" htmlFor="pincode" required error={errors.pincode?.message}>
                  <Input id="pincode" inputMode="numeric" maxLength={6} placeholder="411001" invalid={!!errors.pincode} {...register("pincode")} />
                </Field>
              </div>
            )}

            {/* ---------- Step 2: Tax ---------- */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4">
                <Field label="GSTIN" htmlFor="gstin" required error={errors.gstin?.message} hint="15-character GST number, e.g. 22AAAAA0000A1Z5">
                  <Input id="gstin" maxLength={15} autoCapitalize="characters" placeholder="22AAAAA0000A1Z5" className="font-mono uppercase tracking-wider" invalid={!!errors.gstin} {...register("gstin")} />
                </Field>
                <Field label="PAN" htmlFor="pan" required error={errors.pan?.message} hint="10-character PAN, e.g. ABCDE1234F">
                  <Input id="pan" maxLength={10} autoCapitalize="characters" placeholder="ABCDE1234F" className="font-mono uppercase tracking-wider" invalid={!!errors.pan} {...register("pan")} />
                </Field>
                <p className="rounded-xl bg-secondary/70 px-4 py-3 text-xs text-secondary-foreground">
                  Both are validated against the official Indian formats
                  (including the GSTIN checksum) before anything is saved.
                </p>
              </div>
            )}

            {/* ---------- Step 3: Compliance ---------- */}
            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Your role" htmlFor="vendorRole" required error={errors.vendorRole?.message} className="sm:col-span-2">
                  <Select id="vendorRole" invalid={!!errors.vendorRole} defaultValue="" {...register("vendorRole")}>
                    <option value="" disabled>Select role…</option>
                    {VENDOR_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="FSSAI license number" htmlFor="fssaiLicense" required error={errors.fssaiLicense?.message} hint="14-digit license number">
                  <Input id="fssaiLicense" inputMode="numeric" maxLength={14} placeholder="12345678901234" className="font-mono tracking-wider" invalid={!!errors.fssaiLicense} {...register("fssaiLicense")} />
                </Field>

                <Field label="FSSAI license type" htmlFor="fssaiLicenseType" required error={errors.fssaiLicenseType?.message}>
                  <Select id="fssaiLicenseType" invalid={!!errors.fssaiLicenseType} defaultValue="" {...register("fssaiLicenseType")}>
                    <option value="" disabled>Select…</option>
                    {FSSAI_LICENSE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="License expiry" htmlFor="fssaiExpiry" required error={errors.fssaiExpiry?.message}>
                  <Input id="fssaiExpiry" type="date" invalid={!!errors.fssaiExpiry} {...register("fssaiExpiry")} />
                </Field>

                <Field
                  label="IEC (Import-Export Code)"
                  htmlFor="iec"
                  required={isImporter}
                  error={errors.iec?.message}
                  hint={isImporter ? "Required for importers" : "Optional"}
                >
                  <Input id="iec" maxLength={10} autoCapitalize="characters" placeholder="ABCDE1234F" className="font-mono uppercase" invalid={!!errors.iec} {...register("iec")} />
                </Field>

                {/* Product categories */}
                <div className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-foreground">
                    Product categories<span className="ml-0.5 text-destructive">*</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const on = selectedCats.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={[
                            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                            on
                              ? "border-primary bg-primary text-primary-foreground shadow-glow-emerald"
                              : "border-input bg-white/60 text-foreground/70 hover:border-primary/40 hover:text-primary",
                          ].join(" ")}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {errors.productCategories && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.productCategories.message as string}
                    </p>
                  )}
                </div>

                {/* GMP */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-white/60 px-4 py-3 sm:col-span-2">
                  <input type="checkbox" className="h-4 w-4 accent-[hsl(171_67%_18%)]" {...register("gmpCertified")} />
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Award className="h-4 w-4 text-accent" />
                    GMP (Good Manufacturing Practices) certified
                  </span>
                </label>

                {/* FSSAI certificate */}
                <div className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-foreground">
                    FSSAI certificate<span className="ml-0.5 text-destructive">*</span>
                  </span>
                  <CertificateUpload
                    file={certificate}
                    onChange={(f) => {
                      setCertificate(f);
                      setCertError(undefined);
                    }}
                    error={certError}
                  />
                </div>
              </div>
            )}

            {/* ---------- Step 4: Bank ---------- */}
            {step === 3 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Account holder name" htmlFor="accountHolder" required error={errors.accountHolder?.message} className="sm:col-span-2" hint="As per bank records">
                  <Input id="accountHolder" placeholder="Acme Wellness Pvt. Ltd." invalid={!!errors.accountHolder} {...register("accountHolder")} />
                </Field>
                <Field label="Account number" htmlFor="accountNumber" required error={errors.accountNumber?.message}>
                  <Input id="accountNumber" inputMode="numeric" placeholder="000123456789" className="font-mono" invalid={!!errors.accountNumber} {...register("accountNumber")} />
                </Field>
                <Field label="Confirm account number" htmlFor="confirmAccountNumber" required error={errors.confirmAccountNumber?.message}>
                  <Input id="confirmAccountNumber" inputMode="numeric" placeholder="000123456789" className="font-mono" invalid={!!errors.confirmAccountNumber} {...register("confirmAccountNumber")} />
                </Field>
                <Field label="IFSC code" htmlFor="ifsc" required error={errors.ifsc?.message} hint="e.g. HDFC0001234">
                  <Input id="ifsc" maxLength={11} autoCapitalize="characters" placeholder="HDFC0001234" className="font-mono uppercase" invalid={!!errors.ifsc} {...register("ifsc")} />
                </Field>
                <Field label="Bank name" htmlFor="bankName" required error={errors.bankName?.message}>
                  <Input id="bankName" placeholder="HDFC Bank" invalid={!!errors.bankName} {...register("bankName")} />
                </Field>
                <p className="rounded-xl bg-secondary/70 px-4 py-3 text-xs text-secondary-foreground sm:col-span-2">
                  Settlements from your sales are routed here automatically via
                  Razorpay Route after each order.
                </p>
              </div>
            )}

            {/* ---------- Step 5: Review & declaration ---------- */}
            {step === 4 && (
              <div className="space-y-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-xl border border-white/60 bg-white/50 p-4 text-sm sm:grid-cols-2">
                  {[
                    ["Legal name", watch("legalName")],
                    ["Brand", watch("brandName")],
                    ["Business type", watch("businessType")],
                    ["GSTIN", watch("gstin")],
                    ["PAN", watch("pan")],
                    ["Role", watch("vendorRole")],
                    ["FSSAI", watch("fssaiLicense")],
                    ["Categories", selectedCats.join(", ")],
                    ["Bank", watch("bankName")],
                    ["IFSC", watch("ifsc")],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between gap-3 border-b border-white/50 py-1 last:border-0">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="truncate text-right font-medium text-foreground">
                        {(v as string) || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-white/60 px-4 py-3">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(171_67%_18%)]" {...register("declarationAccepted")} />
                  <span className="text-sm text-foreground">
                    I confirm all information is accurate, my products comply with
                    the FSS Act &amp; Regulations, and I am authorised to register
                    this business.
                  </span>
                </label>
                {errors.declarationAccepted && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.declarationAccepted.message as string}
                  </p>
                )}
              </div>
            )}

            {submitError && (
              <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {submitError}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={back} disabled={step === 0 || submitting} className={step === 0 ? "invisible" : ""}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {!isLast ? (
                <Button type="button" onClick={next}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit application
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
