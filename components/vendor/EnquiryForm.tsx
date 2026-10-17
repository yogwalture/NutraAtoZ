"use client";

import * as React from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnquiry } from "@/app/become-a-vendor/actions";

export default function EnquiryForm() {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const [done, setDone] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const res = await submitEnquiry(fd);
      if (res.ok) setDone(true);
      else setError(res.error ?? "Something went wrong. Please try again.");
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-3 font-serif text-xl font-semibold text-emerald-800">
          Thanks — we&apos;ve got your details!
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          A member of our vendor team will call you shortly to walk you through
          onboarding. Keep your GSTIN, PAN and FSSAI handy.
        </p>
        <a
          href="/vendor/onboarding"
          className="mt-4 inline-block text-sm font-semibold text-coral-600 hover:underline"
        >
          Prefer to register now? Start the full form →
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <div className="space-y-1.5">
        <Label htmlFor="company_name">Company / brand name *</Label>
        <Input id="company_name" name="company_name" required placeholder="e.g. PureMarine Nutrition" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Your name</Label>
          <Input id="contact_name" name="contact_name" placeholder="Full name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Phone *</Label>
          <Input id="contact_phone" name="contact_phone" type="tel" placeholder="10-digit mobile" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Email</Label>
          <Input id="contact_email" name="contact_email" type="email" placeholder="you@yourbrand.in" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product_category">Product category</Label>
          <Input id="product_category" name="product_category" placeholder="Protein, vitamins, ayurveda…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="City" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" placeholder="State" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Anything else?</Label>
        <Textarea id="message" name="message" placeholder="Tell us about your products, or the best time to call." />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Request a callback
          </>
        )}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        By submitting, you agree to be contacted by the Nutraatoz vendor team.
      </p>
    </form>
  );
}
