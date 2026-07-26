"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Store,
  ReceiptText,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  PartyPopper,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Field from "./Field";
import CertificateUpload from "./CertificateUpload";
import {
  vendorOnboardingSchema,
  type VendorOnboarding,
} from "@/lib/validation";
import { submitVendor } from "@/lib/submitVendor";

type FieldName = keyof VendorOnboarding;

const STEPS: {
  title: string;
  short: string;
  description: string;
  icon: typeof Store;
  fields: FieldName[];
}[] = [
  {
    title: "Store & Company Details",
    short: "Store",
    description: "Tell us about your business and how to reach you.",
    icon: Store,
    fields: [
      "companyName",
      "storeName",
      "contactPerson",
      "email",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ],
  },
  {
    title: "Indian Tax Data",
    short: "Tax",
    description: "Your GSTIN and PAN, verified against statutory formats.",
    icon: ReceiptText,
    fields: ["gstin", "pan"],
  },
  {
    title: "Compliance & Licensing",
    short: "Compliance",
    description: "FSSAI license details and a copy of the certificate.",
    icon: ShieldCheck,
    fields: ["fssaiLicense", "fssaiExpiry"],
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
    formState: { errors },
  } = useForm<VendorOnboarding>({
    resolver: zodResolver(vendorOnboardingSchema),
    mode: "onTouched",
  });

  const isLast = step === STEPS.length - 1;

  async function next() {
    const valid = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setSubmitError(undefined);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onValid(data: VendorOnboarding) {
    setSubmitError(undefined);
    if (!certificate) {
      setCertError("Please upload your FSSAI certificate to continue.");
      return;
    }
    setSubmitting(true);
    const result = await submitVendor(data, certificate);
    setSubmitting(false);
    if (result.ok) {
      setDone(true);
    } else {
      setSubmitError(result.error ?? "Submission failed. Please try again.");
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-xl animate-fade-in text-center">
        <CardContent className="flex flex-col items-center gap-4 px-8 py-12">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <PartyPopper className="h-8 w-8" />
          </span>
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Application submitted!
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Thanks for applying to sell on Nutraatoz. Our team will verify your
            GSTIN and FSSAI license and email you once your store is approved.
          </p>
        </CardContent>
      </Card>
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
                    "grid h-11 w-11 place-items-center rounded-full border-2 transition-colors",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-card text-muted-foreground",
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
                    "text-xs font-medium",
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
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    i < step ? "bg-primary" : "bg-input",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      <Card className="animate-fade-in">
        <CardHeader>
          <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <ActiveIcon className="h-4 w-4" />
            Step {step + 1} of {STEPS.length}
          </span>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onValid)} noValidate>
            {/* -------- Step 1: Store & Company -------- */}
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Registered company name"
                  htmlFor="companyName"
                  required
                  error={errors.companyName?.message}
                  className="sm:col-span-2"
                >
                  <Input
                    id="companyName"
                    placeholder="Acme Wellness Pvt. Ltd."
                    invalid={!!errors.companyName}
                    {...register("companyName")}
                  />
                </Field>

                <Field
                  label="Store display name"
                  htmlFor="storeName"
                  required
                  error={errors.storeName?.message}
                >
                  <Input
                    id="storeName"
                    placeholder="Acme Wellness"
                    invalid={!!errors.storeName}
                    {...register("storeName")}
                  />
                </Field>

                <Field
                  label="Contact person"
                  htmlFor="contactPerson"
                  required
                  error={errors.contactPerson?.message}
                >
                  <Input
                    id="contactPerson"
                    placeholder="Priya Sharma"
                    invalid={!!errors.contactPerson}
                    {...register("contactPerson")}
                  />
                </Field>

                <Field
                  label="Business email"
                  htmlFor="email"
                  required
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="vendor@acme.in"
                    invalid={!!errors.email}
                    {...register("email")}
                  />
                </Field>

                <Field
                  label="Mobile number"
                  htmlFor="phone"
                  required
                  error={errors.phone?.message}
                  hint="10-digit Indian mobile"
                >
                  <Input
                    id="phone"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    invalid={!!errors.phone}
                    {...register("phone")}
                  />
                </Field>

                <Field
                  label="Registered address"
                  htmlFor="addressLine"
                  required
                  error={errors.addressLine?.message}
                  className="sm:col-span-2"
                >
                  <Input
                    id="addressLine"
                    placeholder="Plot 14, MIDC Industrial Area"
                    invalid={!!errors.addressLine}
                    {...register("addressLine")}
                  />
                </Field>

                <Field
                  label="City"
                  htmlFor="city"
                  required
                  error={errors.city?.message}
                >
                  <Input
                    id="city"
                    placeholder="Pune"
                    invalid={!!errors.city}
                    {...register("city")}
                  />
                </Field>

                <Field
                  label="State"
                  htmlFor="state"
                  required
                  error={errors.state?.message}
                >
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    invalid={!!errors.state}
                    {...register("state")}
                  />
                </Field>

                <Field
                  label="PIN code"
                  htmlFor="pincode"
                  required
                  error={errors.pincode?.message}
                >
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="411001"
                    invalid={!!errors.pincode}
                    {...register("pincode")}
                  />
                </Field>
              </div>
            )}

            {/* -------- Step 2: Indian Tax Data -------- */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4">
                <Field
                  label="GSTIN"
                  htmlFor="gstin"
                  required
                  error={errors.gstin?.message}
                  hint="15-character GST identification number, e.g. 22AAAAA0000A1Z5"
                >
                  <Input
                    id="gstin"
                    maxLength={15}
                    autoCapitalize="characters"
                    placeholder="22AAAAA0000A1Z5"
                    className="font-mono uppercase tracking-wider"
                    invalid={!!errors.gstin}
                    {...register("gstin")}
                  />
                </Field>

                <Field
                  label="PAN"
                  htmlFor="pan"
                  required
                  error={errors.pan?.message}
                  hint="10-character Permanent Account Number, e.g. ABCDE1234F"
                >
                  <Input
                    id="pan"
                    maxLength={10}
                    autoCapitalize="characters"
                    placeholder="ABCDE1234F"
                    className="font-mono uppercase tracking-wider"
                    invalid={!!errors.pan}
                    {...register("pan")}
                  />
                </Field>

                <p className="rounded-lg bg-secondary px-4 py-3 text-xs text-secondary-foreground">
                  We validate both numbers against the official Indian formats
                  (including the GSTIN checksum) before anything is saved.
                </p>
              </div>
            )}

            {/* -------- Step 3: Compliance -------- */}
            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="FSSAI license number"
                  htmlFor="fssaiLicense"
                  required
                  error={errors.fssaiLicense?.message}
                  hint="14-digit license number"
                  className="sm:col-span-2"
                >
                  <Input
                    id="fssaiLicense"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="12345678901234"
                    className="font-mono tracking-wider"
                    invalid={!!errors.fssaiLicense}
                    {...register("fssaiLicense")}
                  />
                </Field>

                <Field
                  label="License expiry date"
                  htmlFor="fssaiExpiry"
                  required
                  error={errors.fssaiExpiry?.message}
                  className="sm:col-span-2"
                >
                  <Input
                    id="fssaiExpiry"
                    type="date"
                    invalid={!!errors.fssaiExpiry}
                    {...register("fssaiExpiry")}
                  />
                </Field>

                <div className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-foreground">
                    FSSAI certificate
                    <span className="ml-0.5 text-destructive">*</span>
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

            {submitError && (
              <p className="mt-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {submitError}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                disabled={step === 0 || submitting}
                className={step === 0 ? "invisible" : ""}
              >
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
        </CardContent>
      </Card>
    </div>
  );
}
