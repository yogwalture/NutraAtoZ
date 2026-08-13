"use client";

import * as React from "react";
import { Plus, X, Loader2, AlertCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVendor } from "@/app/admin/actions";

export default function AddVendor() {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const res = await createVendor(fd);
      if (res.ok) setOpen(false);
      else setError(res.error ?? "Something went wrong.");
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add vendor
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="absolute inset-0" onClick={() => !pending && setOpen(false)} />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl2 border border-border bg-card shadow-card-hover sm:max-w-lg sm:rounded-xl2">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
                <Store className="h-5 w-5" />
                Add vendor
              </h2>
              <button
                aria-label="Close"
                onClick={() => !pending && setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-primary/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="store_name">Store name</Label>
                  <Input id="store_name" name="store_name" placeholder="PureMarine" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Company name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="PureMarine Wellness Pvt. Ltd."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_person">Contact person</Label>
                  <Input id="contact_person" name="contact_person" placeholder="Priya Sharma" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input id="contact_email" name="contact_email" type="email" placeholder="hello@brand.in" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input id="contact_phone" name="contact_phone" placeholder="9876543210" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" name="gstin" placeholder="27ABCDE1234F1Z5" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fssai_license_no">FSSAI license no.</Label>
                  <Input id="fssai_license_no" name="fssai_license_no" placeholder="10012345678901" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fssai_expiry">FSSAI expiry</Label>
                  <Input id="fssai_expiry" name="fssai_expiry" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="Pune" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" placeholder="Maharashtra" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="is_approved"
                  defaultChecked
                  className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
                />
                Approve immediately (products go live right away)
              </label>

              {error && (
                <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Add vendor"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
