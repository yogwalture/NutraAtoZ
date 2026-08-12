"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import type { AdminProduct } from "@/lib/adminData";
import { setProductActive } from "@/app/admin/actions";

export default function ProductsModeration({
  products,
}: {
  products: AdminProduct[];
}) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function toggle(p: AdminProduct) {
    setBusyId(p.id);
    startTransition(async () => {
      await setProductActive(p.id, p.is_active === false);
      setBusyId(null);
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
        <p className="text-sm text-muted-foreground">No products listed yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-float backdrop-blur">
      <div className="hidden grid-cols-12 gap-3 border-b border-white/50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
        <span className="col-span-5">Product</span>
        <span className="col-span-3">Vendor</span>
        <span className="col-span-2">Price</span>
        <span className="col-span-2 text-right">Action</span>
      </div>
      <div className="divide-y divide-white/50">
        {products.map((p) => {
          const active = p.is_active !== false;
          const rowBusy = busyId === p.id && pending;
          return (
            <div
              key={p.id}
              className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 sm:grid-cols-12"
            >
              <div className="col-span-5 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary/50">
                  <FlaskConical className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.title}
                  </p>
                  <Badge variant={active ? "success" : "muted"}>
                    {active ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <div className="col-span-3 truncate text-sm text-muted-foreground">
                {p.vendor_name}
              </div>
              <div className="col-span-2 text-sm font-medium text-foreground">
                {formatINR(p.price)}
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => toggle(p)}
                  disabled={rowBusy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                >
                  {rowBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : active ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {active ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
