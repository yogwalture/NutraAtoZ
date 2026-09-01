"use client";

import * as React from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "./CartProvider";

export default function CartContents() {
  const { items, subtotal, setQty, remove, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-40 rounded-2xl bg-white/50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-xl font-semibold text-primary">
          Your cart is empty
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some supplements to get started.
        </p>
        <a
          href="/products"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5"
        >
          Browse products
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-float backdrop-blur"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald/10 to-gold/10 font-serif text-lg font-semibold text-emerald">
              {item.title.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              {item.brand && (
                <p className="text-[11px] uppercase tracking-wide text-mist">
                  {item.brand}
                </p>
              )}
              <p className="truncate text-sm font-semibold text-ink">
                {item.title}
              </p>
              <p className="text-sm font-medium text-emerald">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-input bg-white/70 p-1">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty(item.id, item.qty - 1)}
                className="grid h-7 w-7 place-items-center rounded-full text-ink/70 hover:bg-emerald/5 hover:text-emerald"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium">
                {item.qty}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty(item.id, item.qty + 1)}
                className="grid h-7 w-7 place-items-center rounded-full text-ink/70 hover:bg-emerald/5 hover:text-emerald"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              aria-label="Remove"
              onClick={() => remove(item.id)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-primary">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">₹{subtotal.toLocaleString("en-IN")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-medium">
              {shipping === 0 ? "Free" : `₹${shipping}`}
            </dd>
          </div>
          <div className="flex justify-between border-t border-white/60 pt-2 text-base">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-serif font-semibold text-emerald">
              ₹{total.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
        <a
          href="/checkout"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-3 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5"
        >
          Proceed to checkout
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="/products"
          className="mt-2 block text-center text-xs font-medium text-primary hover:underline"
        >
          Continue shopping
        </a>
      </aside>
    </div>
  );
}
