"use client";

import * as React from "react";
import { Loader2, Check, AlertCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAndRegisterPickup } from "@/app/vendor/dashboard/shipping/actions";

interface Defaults {
  contact_person?: string | null;
  contact_phone?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

export default function PickupForm({
  defaults,
  registered,
}: {
  defaults: Defaults;
  registered: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const [ok, setOk] = React.useState<string>();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    setOk(undefined);
    startTransition(async () => {
      const res = await saveAndRegisterPickup(fd);
      if (res.ok) {
        setOk(
          res.note ??
            (res.registered
              ? "Pickup address saved and registered with Shiprocket."
              : "Pickup address saved.")
        );
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl2 border border-border bg-card p-6 shadow-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Truck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Pickup address
          </h2>
          <p className="text-xs text-muted-foreground">
            Your products ship from here. This is registered as your Shiprocket
            pickup location.
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${
            registered
              ? "bg-emerald-100 text-emerald-700"
              : "bg-accent/15 text-accent"
          }`}
        >
          {registered ? "Registered" : "Not registered"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact_person">Pickup contact name</Label>
          <Input id="contact_person" name="contact_person" required defaultValue={defaults.contact_person ?? ""} placeholder="Warehouse manager" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Pickup phone</Label>
          <Input id="contact_phone" name="contact_phone" inputMode="numeric" maxLength={10} required defaultValue={defaults.contact_phone ?? ""} placeholder="9876543210" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address_line">Address</Label>
          <Input id="address_line" name="address_line" required defaultValue={defaults.address_line ?? ""} placeholder="Unit / building, street, area" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required defaultValue={defaults.city ?? ""} placeholder="Pune" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" required defaultValue={defaults.state ?? ""} placeholder="Maharashtra" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pincode">PIN code</Label>
          <Input id="pincode" name="pincode" inputMode="numeric" maxLength={6} required defaultValue={defaults.pincode ?? ""} placeholder="411001" />
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {ok && (
        <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          <Check className="h-4 w-4 shrink-0" />
          {ok}
        </p>
      )}

      <Button type="submit" className="mt-5" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save pickup address"
        )}
      </Button>
    </form>
  );
}
