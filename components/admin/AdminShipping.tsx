"use client";

import * as React from "react";
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Loader2,
  ExternalLink,
  Pencil,
  Check,
  X,
  Store,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR, formatDate } from "@/lib/format";
import type { ShippingOrder, ShippingStatus } from "@/lib/adminData";
import { adminSetShippingStatus, adminSetTracking } from "@/app/admin/actions";

const STATUSES: { key: ShippingStatus; label: string; tone: string }[] = [
  { key: "PENDING", label: "Pending", tone: "bg-muted text-muted-foreground" },
  { key: "BOOKED", label: "Booked", tone: "bg-accent/15 text-accent" },
  { key: "PACKED", label: "Packed", tone: "bg-primary/10 text-primary" },
  { key: "SHIPPED", label: "Shipped", tone: "bg-blue-100 text-blue-700" },
  { key: "DELIVERED", label: "Delivered", tone: "bg-emerald-100 text-emerald-700" },
  { key: "CANCELLED", label: "Cancelled", tone: "bg-destructive/10 text-destructive" },
  { key: "RTO", label: "RTO", tone: "bg-orange-100 text-orange-700" },
];
const TONE = Object.fromEntries(STATUSES.map((s) => [s.key, s.tone]));

export default function AdminShipping({ orders }: { orders: ShippingOrder[] }) {
  const [filter, setFilter] = React.useState<ShippingStatus | "ALL">("ALL");
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string>();

  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of orders) c[o.shipping_status] = (c[o.shipping_status] ?? 0) + 1;
    return c;
  }, [orders]);

  const shown =
    filter === "ALL" ? orders : orders.filter((o) => o.shipping_status === filter);

  function setStatus(o: ShippingOrder, status: string) {
    setBusyId(o.id);
    setError(undefined);
    startTransition(async () => {
      const res = await adminSetShippingStatus(o.id, status);
      setBusyId(null);
      if (!res.ok && res.error) setError(res.error);
    });
  }

  function saveTracking(o: ShippingOrder, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusyId(o.id);
    setError(undefined);
    startTransition(async () => {
      const res = await adminSetTracking(o.id, fd);
      setBusyId(null);
      if (res.ok) setEditing(null);
      else setError(res.error ?? "Could not save tracking.");
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold text-primary">
          <Truck className="h-6 w-6" />
          Shipping &amp; fulfillment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every order&apos;s delivery status across the marketplace. Update
          status and record courier tracking.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            filter === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-white/70 text-muted-foreground hover:bg-primary/5"
          }`}
        >
          All · {orders.length}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-white/70 text-muted-foreground hover:bg-primary/5"
            }`}
          >
            {s.label} · {counts[s.key] ?? 0}
          </button>
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white/50 px-6 py-16 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm text-muted-foreground">
            No orders{filter === "ALL" ? " yet" : ` in "${filter}"`}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => {
            const rowBusy = busyId === o.id && pending;
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        #{o.id.slice(0, 8)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          TONE[o.shipping_status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {o.shipping_status}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {o.payment_mode}
                        {o.payment_mode === "PREPAID"
                          ? o.status === "PAID"
                            ? " · paid"
                            : " · unpaid"
                          : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(o.created_at)} · {formatINR(o.total_amount)} ·{" "}
                      {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rowBusy && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <select
                      value={o.shipping_status}
                      onChange={(e) => setStatus(o, e.target.value)}
                      disabled={rowBusy}
                      className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Destination */}
                  <div className="rounded-xl border border-border bg-card p-3.5 text-sm">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Ship to
                    </p>
                    <p className="mt-1.5 font-medium text-foreground">
                      {o.customer_name || "—"}
                    </p>
                    {o.customer_phone && (
                      <a
                        href={`tel:${o.customer_phone}`}
                        className="mt-0.5 flex w-fit items-center gap-1.5 text-xs text-coral-700 hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {o.customer_phone}
                      </a>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {o.ship_address || "—"}
                      {o.ship_address ? <br /> : null}
                      {[o.ship_city, o.ship_state, o.ship_pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>

                  {/* Vendors + Shiprocket */}
                  <div className="rounded-xl border border-border bg-card p-3.5 text-sm">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Store className="h-3.5 w-3.5" />
                      Vendors
                    </p>
                    <p className="mt-1.5 text-xs text-foreground">
                      {o.vendors.length ? o.vendors.join(", ") : "—"}
                    </p>
                    {o.shiprocket.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-border pt-2">
                        {o.shiprocket.map((r, i) => (
                          <div key={i} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {r.vendor_name}
                            </span>
                            {r.status === "created" && r.awb_code ? (
                              <> · AWB {r.awb_code}</>
                            ) : r.status === "skipped" ? (
                              <> · {r.message || "skipped"}</>
                            ) : r.status === "error" ? (
                              <> · error: {r.message}</>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking */}
                <div className="mt-3 rounded-xl border border-border bg-secondary/30 p-3.5">
                  {editing === o.id ? (
                    <form onSubmit={(e) => saveTracking(o, e)} className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label htmlFor={`courier-${o.id}`} className="text-xs text-muted-foreground">
                            Courier
                          </Label>
                          <Input
                            id={`courier-${o.id}`}
                            name="tracking_courier"
                            defaultValue={o.tracking_courier ?? ""}
                            placeholder="Delhivery, BlueDart…"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`awb-${o.id}`} className="text-xs text-muted-foreground">
                            AWB / tracking no.
                          </Label>
                          <Input
                            id={`awb-${o.id}`}
                            name="tracking_awb"
                            defaultValue={o.tracking_awb ?? ""}
                            placeholder="1234567890"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`url-${o.id}`} className="text-xs text-muted-foreground">
                            Tracking URL
                          </Label>
                          <Input
                            id={`url-${o.id}`}
                            name="tracking_url"
                            type="url"
                            defaultValue={o.tracking_url ?? ""}
                            placeholder="https://…"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={rowBusy}>
                          {rowBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Save tracking
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        {o.tracking_awb || o.tracking_courier ? (
                          <span className="text-foreground">
                            {o.tracking_courier ? `${o.tracking_courier} · ` : ""}
                            {o.tracking_awb || "—"}
                          </span>
                        ) : (
                          "No courier tracking recorded"
                        )}
                        {o.tracking_url && (
                          <a
                            href={o.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center gap-1 text-coral-700 hover:underline"
                          >
                            Track <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEditing(o.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                        {o.tracking_awb ? "Edit tracking" : "Add tracking"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
