"use client";

import * as React from "react";
import { X, Loader2, AlertCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminVendor } from "@/lib/adminData";
import { adminUpdateVendor } from "@/app/admin/actions";

export default function VendorFormModal({
  vendor,
  onClose,
}: {
  vendor: AdminVendor;
  onClose: () => void;
}) {
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const res = await adminUpdateVendor(vendor.id, fd);
      if (res.ok) onClose();
      else setError(res.error ?? "Something went wrong.");
    });
  }

  const F = ({
    name,
    label,
    defaultValue,
    type = "text",
    placeholder,
  }: {
    name: string;
    label: string;
    defaultValue?: string | number | null;
    type?: string;
    placeholder?: string;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={() => !pending && onClose()} />
      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl2 border border-border bg-card shadow-card-hover sm:max-w-2xl sm:rounded-xl2">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
            <Store className="h-5 w-5" />
            Edit vendor
          </h2>
          <button
            aria-label="Close"
            onClick={() => !pending && onClose()}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-primary/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <F name="store_name" label="Store name" defaultValue={vendor.store_name} />
            <F name="company_name" label="Company name" defaultValue={vendor.company_name} />
            <F name="contact_person" label="Contact person" defaultValue={vendor.contact_person} />
            <F name="contact_email" label="Email" type="email" defaultValue={vendor.contact_email} />
            <F name="contact_phone" label="Phone" defaultValue={vendor.contact_phone} />
            <F name="commission_pct" label="Vendor commission %" type="number" defaultValue={vendor.commission_pct} placeholder="Platform default if blank" />
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Address
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F name="address_line" label="Address" defaultValue={vendor.address_line} />
              <F name="city" label="City" defaultValue={vendor.city} />
              <F name="state" label="State" defaultValue={vendor.state} />
              <F name="pincode" label="Pincode" defaultValue={vendor.pincode} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Statutory
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F name="gstin" label="GSTIN" defaultValue={vendor.gstin} />
              <F name="pan" label="PAN" defaultValue={vendor.pan} />
              <F name="fssai_license_no" label="FSSAI license no." defaultValue={vendor.fssai_license_no} />
              <F name="fssai_expiry" label="FSSAI expiry" type="date" defaultValue={vendor.fssai_expiry} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bank / payout
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F name="bank_name" label="Bank name" defaultValue={vendor.bank_name} />
              <F name="bank_ifsc" label="IFSC" defaultValue={vendor.bank_ifsc} />
              <F name="bank_account_number" label="Account number" defaultValue={vendor.bank_account_number} />
              <F name="bank_account_holder" label="Account holder" defaultValue={vendor.bank_account_holder} />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
