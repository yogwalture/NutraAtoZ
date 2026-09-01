"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Package,
  AlertCircle,
  FlaskConical,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import {
  effectivePrice,
  discountLabel,
  type DiscountType,
  type ProductAttribute,
} from "@/lib/pricing";
import type { ProductRow } from "@/lib/vendorData";
import {
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
} from "@/app/vendor/dashboard/products/actions";

export default function ProductsManager({
  products,
  canEdit,
}: {
  products: ProductRow[];
  canEdit: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductRow | null>(null);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // form-local state for discount + attributes
  const [discountType, setDiscountType] = React.useState<DiscountType>(null);
  const [attrs, setAttrs] = React.useState<ProductAttribute[]>([]);

  function resetForm(p: ProductRow | null) {
    setDiscountType(p?.discount_type ?? null);
    setAttrs(p?.attributes && p.attributes.length ? p.attributes : []);
  }

  function openCreate() {
    setEditing(null);
    resetForm(null);
    setError(undefined);
    setOpen(true);
  }
  function openEdit(p: ProductRow) {
    setEditing(p);
    resetForm(p);
    setError(undefined);
    setOpen(true);
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
      const res = editing
        ? await updateProduct(editing.id, fd)
        : await createProduct(fd);
      if (res.ok) setOpen(false);
      else setError(res.error ?? "Something went wrong.");
    });
  }

  function handleToggle(p: ProductRow) {
    setBusyId(p.id);
    startTransition(async () => {
      await toggleProductActive(p.id, p.is_active === false);
      setBusyId(null);
    });
  }

  function handleDelete(p: ProductRow) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    startTransition(async () => {
      await deleteProduct(p.id);
      setBusyId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"} in your
            catalog · live on the store as soon as you add them
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canEdit}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {/* Table / list */}
      <div className="overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-foreground">No products yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Add your first supplement to start selling on
              Nutraatoz.
            </p>
            <Button onClick={openCreate} size="sm" disabled={!canEdit}>
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-12 gap-3 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
              <span className="col-span-4">Product</span>
              <span className="col-span-3">Price</span>
              <span className="col-span-1">Comm.</span>
              <span className="col-span-2">Stock</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {products.map((p) => {
                const active = p.is_active !== false;
                const rowBusy = busyId === p.id && pending;
                const dLabel = discountLabel(p.discount_type, p.discount_value);
                const eff = effectivePrice(
                  p.price,
                  p.discount_type,
                  p.discount_value
                );
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 sm:grid-cols-12"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary/50">
                        <FlaskConical className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <Badge variant={active ? "success" : "muted"}>
                            {active ? "Active" : "Hidden"}
                          </Badge>
                          {p.attributes?.length ? (
                            <span className="text-xs text-muted-foreground">
                              {p.attributes.length} attr
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm">
                      {dLabel ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {formatINR(eff)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatINR(p.price)}
                          </span>
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                            {dLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground">
                          {formatINR(p.price)}
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-sm text-muted-foreground">
                      {p.commission_pct != null ? `${p.commission_pct}%` : "—"}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {p.stock ?? "—"}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <button
                        aria-label={active ? "Hide product" : "Show product"}
                        onClick={() => handleToggle(p)}
                        disabled={!canEdit || rowBusy}
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
                        aria-label="Edit product"
                        onClick={() => openEdit(p)}
                        disabled={!canEdit}
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Delete product"
                        onClick={() => handleDelete(p)}
                        disabled={!canEdit || rowBusy}
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ---------- Add / edit modal ---------- */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl2 border border-border bg-card shadow-card-hover sm:max-w-lg sm:rounded-xl2">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-primary">
                {editing ? "Edit product" : "Add product"}
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
                <Label htmlFor="title">Product title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={editing?.title ?? ""}
                  placeholder="Triple-Strength Omega-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Rate / Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={editing?.price ?? ""}
                    placeholder="1299"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Quantity in stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={editing?.stock ?? ""}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight_gms">Weight (g)</Label>
                  <Input
                    id="weight_gms"
                    name="weight_gms"
                    type="number"
                    min="0"
                    defaultValue={editing?.weight_gms ?? ""}
                    placeholder="250"
                  />
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
                    onChange={(e) =>
                      setDiscountType(
                        (e.target.value || null) as DiscountType
                      )
                    }
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
                    defaultValue={editing?.discount_value ?? ""}
                    placeholder={discountType === "FLAT" ? "₹ off" : "% off"}
                  />
                </div>
              </div>

              {/* Attributes repeater */}
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
                    No attributes yet. Add key–value details buyers care about.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {attrs.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={a.label}
                          onChange={(e) => updateAttr(i, "label", e.target.value)}
                          placeholder="Flavour"
                          className="flex-1"
                        />
                        <Input
                          value={a.value}
                          onChange={(e) => updateAttr(i, "value", e.target.value)}
                          placeholder="Orange"
                          className="flex-1"
                        />
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
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  placeholder="What it is, who it's for, key benefits…"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  name="ingredients"
                  defaultValue={editing?.ingredients ?? ""}
                  placeholder="EPA 660mg, DHA 440mg…"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lab_tested_url">Lab report URL</Label>
                <Input
                  id="lab_tested_url"
                  name="lab_tested_url"
                  type="url"
                  defaultValue={editing?.lab_tested_url ?? ""}
                  placeholder="https://…/certificate-of-analysis.pdf"
                />
              </div>

              {error && (
                <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : editing ? (
                    "Save changes"
                  ) : (
                    "Add product"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
