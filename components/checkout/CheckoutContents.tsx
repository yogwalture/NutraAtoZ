"use client";

import * as React from "react";
import {
  Loader2,
  AlertCircle,
  PartyPopper,
  Truck,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart/CartProvider";
import { placeCodOrder } from "@/app/checkout/actions";

export default function CheckoutContents() {
  const { items, subtotal, clear, hydrated } = useCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [done, setDone] = React.useState<{ id: string } | null>(null);

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const fd = new FormData(e.currentTarget);
    const customer = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
      pincode: String(fd.get("pincode") ?? ""),
    };
    setSubmitting(true);
    const res = await placeCodOrder(
      customer,
      items.map((i) => ({ id: i.id, qty: i.qty }))
    );
    setSubmitting(false);
    if (res.ok && res.orderId) {
      setDone({ id: res.orderId });
      clear();
    } else {
      setError(res.error ?? "Could not place your order.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/60 bg-white/70 p-10 text-center shadow-float backdrop-blur-xl">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary shadow-glow-emerald">
          <PartyPopper className="h-8 w-8" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-primary">
          Order placed!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-mono">#{done.id.slice(0, 8)}</span> is
          confirmed for Cash on Delivery. You&apos;ll get a call to confirm
          dispatch.
        </p>
        <a
          href="/products"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-xl font-semibold text-primary">
          Nothing to check out
        </h2>
        <a
          href="/products"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-alabaster shadow-glow-emerald"
        >
          Browse products
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-float backdrop-blur-xl"
      >
        <h2 className="font-serif text-lg font-semibold text-primary">
          Delivery details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required placeholder="Priya Sharma" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" name="phone" inputMode="numeric" maxLength={10} required placeholder="9876543210" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" name="email" type="email" placeholder="you@email.com" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Delivery address</Label>
            <Input id="address" name="address" required placeholder="Flat / house, street, area" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required placeholder="Pune" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required placeholder="Maharashtra" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode">PIN code</Label>
            <Input id="pincode" name="pincode" inputMode="numeric" maxLength={6} required placeholder="411001" />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-input bg-white/60 px-4 py-3 text-sm">
          <Truck className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Cash on Delivery</span>
          <span className="text-muted-foreground">— pay when it arrives</span>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-3 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing order…
            </>
          ) : (
            `Place order · ₹${total.toLocaleString("en-IN")}`
          )}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-primary">
          Your order
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate text-muted-foreground">
                {i.title} × {i.qty}
              </span>
              <span className="shrink-0 font-medium">
                ₹{(i.price * i.qty).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-white/60 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">₹{subtotal.toLocaleString("en-IN")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</dd>
          </div>
          <div className="flex justify-between border-t border-white/60 pt-2 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-serif font-semibold text-emerald">
              ₹{total.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
