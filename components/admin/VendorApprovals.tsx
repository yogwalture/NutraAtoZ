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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { AdminVendor } from "@/lib/adminData";
import { setVendorApproval } from "@/app/admin/actions";

export default function VendorApprovals({
  vendors,
}: {
  vendors: AdminVendor[];
}) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function act(id: string, approved: boolean) {
    setBusyId(id);
    startTransition(async () => {
      await setVendorApproval(id, approved);
      setBusyId(null);
    });
  }

  if (vendors.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/60 px-6 py-16 text-center shadow-float backdrop-blur">
        <p className="text-sm text-muted-foreground">No vendor applications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vendors.map((v) => {
        const rowBusy = busyId === v.id && pending;
        return (
          <div
            key={v.id}
            className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
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
              </div>
              {v.is_approved ? (
                <Badge variant="success">Approved</Badge>
              ) : (
                <Badge variant="warning">Pending</Badge>
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
              <Detail label="GSTIN" value={v.gstin} mono />
              <Detail
                label="FSSAI"
                value={`${v.fssai_license_no ?? "—"}${v.fssai_license_type ? ` · ${v.fssai_license_type}` : ""}`}
                mono
              />
              <Detail label="FSSAI expiry" value={formatDate(v.fssai_expiry)} />
              <Detail label="Applied" value={formatDate(v.created_at)} />
              <Detail label="Contact" value={v.contact_email} />
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
                  View FSSAI certificate
                </a>
              )}
              <div className="ml-auto flex items-center gap-2">
                {v.is_approved ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => act(v.id, false)}
                    disabled={rowBusy}
                  >
                    {rowBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Revoke
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => act(v.id, false)}
                      disabled={rowBusy}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => act(v.id, true)} disabled={rowBusy}>
                      {rowBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
      <dd
        className={`truncate font-medium text-foreground ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
