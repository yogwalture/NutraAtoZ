"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  FlaskConical,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import { effectivePrice, discountLabel } from "@/lib/pricing";
import type { AdminProduct } from "@/lib/adminData";
import {
  setProductActive,
  adminDeleteProduct,
} from "@/app/admin/actions";
import ProductFormModal, {
  type VendorOption,
} from "@/components/admin/ProductFormModal";

export default function AdminProducts({
  products,
  vendors,
}: {
  products: AdminProduct[];
  vendors: VendorOption[];
}) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [modal, setModal] = React.useState<
    { mode: "add" } | { mode: "edit"; product: AdminProduct } | null
  >(null);

  function toggle(p: AdminProduct) {
    setBusyId(p.id);
    startTransition(async () => {
      await setProductActive(p.id, p.is_active === false);
      setBusyId(null);
    });
  }

  function remove(p: AdminProduct) {
    if (!confirm(`Delete "${p.title}"? This permanently removes it.`)) return;
    setBusyId(p.id);
    startTransition(async () => {
      await adminDeleteProduct(p.id);
      setBusyId(null);
    });
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button onClick={() => setModal({ mode: "add" })} disabled={vendors.length === 0}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-float backdrop-blur">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted-foreground">No products listed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-white/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-center">Comm.</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {products.map((p) => {
                  const active = p.is_active !== false;
                  const rowBusy = busyId === p.id && pending;
                  const dLabel = discountLabel(p.discount_type, p.discount_value);
                  const eff = effectivePrice(p.price, p.discount_type, p.discount_value);
                  return (
                    <tr key={p.id} className="hover:bg-primary/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary/50">
                            <FlaskConical className="h-5 w-5" strokeWidth={1.5} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {p.title}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              <Badge variant={active ? "success" : "muted"}>
                                {active ? "Active" : "Hidden"}
                              </Badge>
                              {p.attributes.length > 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  {p.attributes.length} attr
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.vendor_name}</td>
                      <td className="px-5 py-3 text-right">
                        {dLabel ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-medium text-foreground">{formatINR(eff)}</span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatINR(p.price)}
                            </span>
                          </span>
                        ) : (
                          <span className="font-medium text-foreground">{formatINR(p.price)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center text-muted-foreground">
                        {p.commission_pct != null ? `${p.commission_pct}%` : "—"}
                      </td>
                      <td className="px-5 py-3 text-center text-muted-foreground">
                        {p.stock ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            aria-label={active ? "Hide" : "Show"}
                            onClick={() => toggle(p)}
                            disabled={rowBusy}
                            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                          >
                            {rowBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : active ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            aria-label="Edit"
                            onClick={() => setModal({ mode: "edit", product: p })}
                            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            aria-label="Delete"
                            onClick={() => remove(p)}
                            disabled={rowBusy}
                            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ProductFormModal
          vendors={vendors}
          product={modal.mode === "edit" ? modal.product : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
