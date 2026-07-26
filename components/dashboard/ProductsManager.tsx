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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
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

  function openCreate() {
    setEditing(null);
    setError(undefined);
    setOpen(true);
  }
  function openEdit(p: ProductRow) {
    setEditing(p);
    setError(undefined);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
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
            catalog
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
              Add your first lab-tested supplement to start selling on
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
              <span className="col-span-5">Product</span>
              <span className="col-span-2">Price</span>
              <span className="col-span-2">Commission</span>
              <span className="col-span-1">Stock</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {products.map((p) => {
                const active = p.is_active !== false;
                const rowBusy = busyId === p.id && pending;
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 sm:grid-cols-12"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary/50">
                        <FlaskConical className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Badge variant={active ? "success" : "muted"}>
                            {active ? "Active" : "Hidden"}
                          </Badge>
                          {p.weight_gms ? (
                            <span className="text-xs text-muted-foreground">
                              {p.weight_gms} g
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm font-medium text-foreground">
                      {formatINR(p.price)}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {p.commission_pct != null ? `${p.commission_pct}%` : "—"}
                    </div>
                    <div className="col-span-1 text-sm text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-emerald-800/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl2 border border-border bg-card shadow-card-hover sm:max-w-lg sm:rounded-xl2">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (₹)</Label>
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
                  <Label htmlFor="commission_pct">Commission %</Label>
                  <Input
                    id="commission_pct"
                    name="commission_pct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue={editing?.commission_pct ?? 15}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Stock</Label>
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
