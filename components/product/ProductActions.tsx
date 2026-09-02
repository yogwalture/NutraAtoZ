"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Zap } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { track } from "@/lib/track";

export default function ProductActions({
  id,
  title,
  price,
  brand,
  inStock = true,
}: {
  id: string;
  title: string;
  price: number;
  brand?: string;
  inStock?: boolean;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [added, setAdded] = React.useState(false);

  function addToCart() {
    add({ id, title, price, brand });
    track("add_to_cart", { productId: id });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  function buyNow() {
    add({ id, title, price, brand });
    track("add_to_cart", { productId: id, meta: { buyNow: true } });
    router.push("/checkout");
  }

  if (!inStock) {
    return (
      <div className="rounded-full bg-secondary px-6 py-3.5 text-center text-sm font-bold text-mist">
        Out of stock
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={addToCart}
        className="shine inline-flex items-center justify-center gap-2 rounded-full border border-coral/30 bg-white px-7 py-3.5 text-sm font-bold text-coral-700 shadow-card transition-transform hover:-translate-y-0.5"
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {added ? "Added to cart" : "Add to cart"}
      </button>
      <button
        onClick={buyNow}
        className="shine inline-flex items-center justify-center gap-2 rounded-full bg-citrus-gradient px-7 py-3.5 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
      >
        <Zap className="h-4 w-4" />
        Buy now
      </button>
    </div>
  );
}
