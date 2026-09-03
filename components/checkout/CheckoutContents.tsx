"use client";

import * as React from "react";
import {
  Loader2,
  AlertCircle,
  PartyPopper,
  Truck,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart/CartProvider";
import { placeCodOrder } from "@/app/checkout/actions";
import { track } from "@/lib/track";

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (resp: unknown) => void) => void;
}
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

/** Loads the Razorpay Checkout script once. */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutContents() {
  const { items, subtotal, clear, hydrated } = useCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [payingOnline, setPayingOnline] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [done, setDone] = React.useState<{ id: string; mode: "COD" | "PREPAID" } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const beganCheckout = React.useRef(false);
  React.useEffect(() => {
    if (hydrated && items.length > 0 && !beganCheckout.current) {
      beganCheckout.current = true;
      track("begin_checkout", { meta: { items: items.length } });
    }
  }, [hydrated, items.length]);

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
      setDone({ id: res.orderId, mode: "COD" });
      clear();
    } else {
      setError(res.error ?? "Could not place your order.");
    }
  }

  async function payOnline() {
    setError(undefined);
    // Reuse the delivery form's built-in validation.
    if (formRef.current && !formRef.current.reportValidity()) return;
    const fd = new FormData(formRef.current ?? undefined);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const phone = String(fd.get("phone") ?? "");

    setPayingOnline(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        setError("Couldn't load the payment gateway. Check your connection and retry.");
        setPayingOnline(false);
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not start the payment.");
        setPayingOnline(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key_id,
        order_id: data.razorpay_order_id,
        amount: data.amount,
        currency: data.currency,
        name: "Nutraatoz",
        description: "Order payment",
        prefill: { name, email, contact: phone },
        theme: { color: "#0F4C43" },
        handler: async (resp: unknown) => {
          const r = resp as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          const vr = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: r.razorpay_order_id,
              razorpay_payment_id: r.razorpay_payment_id,
              razorpay_signature: r.razorpay_signature,
            }),
          });
          if (vr.ok) {
            setDone({ id: data.order_id, mode: "PREPAID" });
            clear();
          } else {
            const vd = await vr.json().catch(() => ({}));
            setError(vd?.error ?? "We couldn't verify your payment. If you were charged, contact support.");
          }
          setPayingOnline(false);
        },
        modal: {
          ondismiss: () => {
            setPayingOnline(false);
            setError("Payment cancelled. Your order was not placed.");
          },
        },
      });
      rzp.on("payment.failed", (resp: unknown) => {
        const rr = resp as { error?: { description?: string } };
        setError(rr?.error?.description ?? "Payment failed. Please try again.");
        setPayingOnline(false);
      });
      rzp.open();
    } catch {
      setError("Something went wrong starting the payment.");
      setPayingOnline(false);
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
          confirmed{done.mode === "PREPAID" ? " and payment received" : " for Cash on Delivery"}.
          You&apos;ll get a call to confirm dispatch.
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
        ref={formRef}
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

        <p className="pt-1 text-sm font-semibold text-foreground">Payment</p>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Pay online (Razorpay) */}
        <button
          type="button"
          onClick={payOnline}
          disabled={payingOnline || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-3 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {payingOnline ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening secure checkout…
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay online · ₹{total.toLocaleString("en-IN")}
            </>
          )}
        </button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Cash on Delivery */}
        <button
          type="submit"
          disabled={submitting || payingOnline}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-white/70 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              <Truck className="h-4 w-4" />
              Cash on Delivery · ₹{total.toLocaleString("en-IN")}
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Online payments are processed securely by Razorpay.
        </p>
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
