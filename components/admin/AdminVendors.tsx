"use client";

import * as React from "react";
import {
  Check,
  X,
  Loader2,
  FileText,
  Store,
  MapPin,
  Landmark,
  Pencil,
  Trash2,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { AdminVendor } from "@/lib/adminData";
import { setVendorApproval, adminDeleteVendor } from "@/app/admin/actions";
import AddVendor from "@/components/admin/AddVendor";
import VendorFormModal from "@/components/admin/VendorFormModal";

export default function AdminVendors({ vendors }: { vendors: AdminVendor[] }) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<AdminVendor | null>(null);

  function approve(id: string, approved: boolean) {
    setBusyId(id);
    startTransition(async () => {
      await setVendorApproval(id, approved);
      setBusyId(null);
    });
  }

  function remove(v: AdminVendor) {
    if (
      !confirm(
        `Delete "${v.store_name || v.company_name}"? This removes the vendor and all their products.`
      )
    )
      return;
    setBusyId(v.id);
    startTransition(async () => {
      const res = await adminDeleteVendor(v.id);
      setBusyId(null);
      if (!res.ok && res.error) alert(res.error);
    });
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <AddVendor />
      </div>

      {vendors.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
          <p className="text-sm text-muted-foreground">No vendors yet.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {vendors.map((v) => {
            const rowBusy = busyId === v.id && pending;
            return (
              <div
                key={v.id}
                className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Store className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {v.store_name || v.company_name || "Unnamed vendor"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.company_name} · {v.business_type ?? "—"} ·{" "}
                        {v.vendor_role ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.commission_pct != null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                        <Percent className="h-3 w-3" />
                        {v.commission_pct}%
                      </span>
                    )}
                    {v.is_approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                  <Detail label="GSTIN" value={v.gstin} mono />
                  <Detail label="PAN" value={v.pan} mono />
                  <Detail
                    label="FSSAI"
                    value={`${v.fssai_license_no ?? "—"}${v.fssai_license_type ? ` · ${v.fssai_license_type}` : ""}`}
                    mono
                  />
                  <Detail label="FSSAI expiry" value={formatDate(v.fssai_expiry)} />
                  <Detail label="Contact" value={v.contact_person} />
                  <Detail label="Email" value={v.contact_email} />
                  <Detail label="Phone" value={v.contact_phone} />
                  <Detail
                    label="Location"
                    value={[v.city, v.state].filter(Boolean).join(", ") || "—"}
                    icon={<MapPin className="h-3 w-3" />}
                  />
                  <Detail
                    label="Bank"
                    value={`${v.bank_name ?? "—"}${v.bank_ifsc ? ` · ${v.bank_ifsc}` : ""}`}
                    icon={<Landmark className="h-3 w-3" />}
                  />
                  <Detail label="Applied" value={formatDate(v.created_at)} />
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/50 pt-4">
                  {v.fssai_certificate_url && (
                    <a
                      href={v.fssai_certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-white/70 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      FSSAI certificate
                    </a>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(v)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    {v.is_approved ? (
                      <Button variant="outline" size="sm" onClick={() => approve(v.id, false)} disabled={rowBusy}>
                        {rowBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Revoke
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => approve(v.id, true)} disabled={rowBusy}>
                        {rowBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(v)}
                      disabled={rowBusy}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <VendorFormModal vendor={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function Detail({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className={`truncate font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
