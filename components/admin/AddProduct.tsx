"use client";

import * as React from "react";
import { Plus, X, Loader2, AlertCircle, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DiscountType, ProductAttribute } from "@/lib/pricing";
import { adminCreateProduct } from "@/app/admin/actions";

export interface VendorOption {
  id: string;
  name: string;
}

export default function AddProduct({ vendors }: { vendors: VendorOption[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const [discountType, setDiscountType] = React.useState<DiscountType>(null);
  const [attrs, setAttrs] = React.useState<ProductAttribute[]>([]);

  function reset() {
    setDiscountType(null);
    setAttrs([]);
    setError(undefined);
  }

  function addAttr() {
    setAttrs((a) => [...a, { label: "", value: "" }]);
  }
  function updateAttr(i: number, key: "label" | "value", val: string) {
    setAttrs((a) => a.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  }
  function removeAttr(i: number) {
    setAttrs((a) => a.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set(
      "attributes",
      JSON.stringify(attrs.filter((a) => a.label.trim() && a.value.trim()))
    );
    setError(undefined);
    startTransition(async () => {
      const res = await adminCreateProduct(fd);
      if (res.ok) {
        setOpen(false);
        reset();
      } else setError(res.error ?? "Something went wrong.");
    });
  }

  const disabled = vendors.length === 0;

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled}>
        <Plus className="h-4 w-4" />
        Add product
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="absolute inset-0" onClick={() => !pending && setOpen(false)} />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl2 border border-border bg-card shadow-card-hover sm:max-w-lg sm:rounded-xl2">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
                <Package className="h-5 w-5" />
                Add product
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
              <div className="space-y-1.5">
                <Label htmlFor="vendor_id">Vendor</Label>
                <select
                  id="vendor_id"
                  name="vendor_id"
                  required
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Product title</Label>
                <Input id="title" name="title" required placeholder="Triple-Strength Omega-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Rate / Price (₹)</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" required placeholder="1299" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="commission_pct">Commission %</Label>
                  <Input id="commission_pct" name="commission_pct" type="number" min="0" max="100" step="0.1" defaultValue={15} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Quantity in stock</Label>
                  <Input id="stock" name="stock" type="number" min="0" placeholder="100" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight_gms">Weight (g)</Label>
                  <Input id="weight_gms" name="weight_gms" type="number" min="0" placeholder="250" />
                </div>
              </div>

              {/* Discount */}
              <div className="rounded-xl border border-border bg-secondary/40 p-3.5">
                <Label className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-accent" />
                  Discount (optional)
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <select
                    name="discount_type"
                    value={discountType ?? ""}
                    onChange={(e) => setDiscountType((e.target.value || null) as DiscountType)}
                    className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">No discount</option>
                    <option value="PCT">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                  <Input
                    name="discount_value"
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!discountType}
                    placeholder={discountType === "FLAT" ? "₹ off" : "% off"}
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="rounded-xl border border-border bg-secondary/40 p-3.5">
                <div className="flex items-center justify-between">
                  <Label>Attributes (flavour, form, servings…)</Label>
                  <button
                    type="button"
                    onClick={addAttr}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                {attrs.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No attributes yet.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {attrs.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input value={a.label} onChange={(e) => updateAttr(i, "label", e.target.value)} placeholder="Flavour" className="flex-1" />
                        <Input value={a.value} onChange={(e) => updateAttr(i, "value", e.target.value)} placeholder="Orange" className="flex-1" />
                        <button
                          type="button"
                          aria-label="Remove attribute"
                          onClick={() => removeAttr(i)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="What it is, who it's for, key benefits…" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lab_tested_url">Lab report URL</Label>
                <Input id="lab_tested_url" name="lab_tested_url" type="url" placeholder="https://…/certificate-of-analysis.pdf" />
              </div>

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
                    "Add product"
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
