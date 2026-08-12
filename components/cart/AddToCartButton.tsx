"use client";

import * as React from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  id: string;
  title: string;
  price: number;
  brand?: string;
  /** "icon" = round + icon only; "full" = labelled button. */
  variant?: "icon" | "full";
  className?: string;
}

export default function AddToCartButton({
  id,
  title,
  price,
  brand,
  variant = "icon",
  className = "",
}: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);

  function onAdd() {
    add({ id, title, price, brand });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  if (variant === "full") {
    return (
      <button
        onClick={onAdd}
        aria-label={`Add ${title} to cart`}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-alabaster shadow-glow-emerald transition-transform hover:-translate-y-0.5 ${className}`}
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
        {added ? "Added" : "Add to cart"}
      </button>
    );
  }

  return (
    <button
      onClick={onAdd}
      aria-label={`Add ${title} to cart`}
      className={`grid h-9 w-9 place-items-center rounded-full bg-emerald text-alabaster shadow-glow-emerald transition-transform hover:scale-110 hover:bg-emerald-700 ${className}`}
    >
      {added ? (
        <Check className="h-4 w-4" strokeWidth={2.5} />
      ) : (
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      )}
    </button>
  );
}
