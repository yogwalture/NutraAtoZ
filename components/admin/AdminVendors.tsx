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
  Link2,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { AdminVendor } from "@/lib/adminData";
import {
  setVendorApproval,
  adminDeleteVendor,
  getVendorActivationLink,
} from "@/app/admin/actions";
import AddVendor from "@/components/admin/AddVendor";
import VendorFormModal from "@/components/admin/VendorFormModal";

export default function AdminVendors({ vendors }: { vendors: AdminVendor[] }) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<AdminVendor | null>(null);
  const [linkModal, setLinkModal] = React.useState<{
    link: string;
    email?: string;
  } | null>(null);

  function approve(id: string, approved: boolean) {
    setBusyId(id);
    startTransition(async () => {
      const res = await setVendorApproval(id, approved);
      setBusyId(null);
      if (!res.ok && res.error) {
        alert(res.error);
        return;
      }
      if (res.activationLink) {
        setLinkModal({ link: res.activationLink, email: res.vendorEmail });
      } else if (res.message) {
        alert(res.message);
      }
    });
  }

  function copyLink(id: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await getVendorActivationLink(id);
      setBusyId(null);
      if (!res.ok || !res.activationLink) {
        alert(res.error || "Could not generate an activation link.");
        return;
      }
      setLinkModal({ link: res.activationLink, email: res.vendorEmail });
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(v.id)}
                      disabled={rowBusy}
                      title="Generate a set-password link to send to this vendor"
                    >
                      {rowBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      Activation link
                    </Button>
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

      {linkModal && (
        <ActivationLinkModal
          link={linkModal.link}
          email={linkModal.email}
          onClose={() => setLinkModal(null)}
        />
      )}
    </>
  );
}

function ActivationLinkModal({
  link,
  email,
  onClose,
}: {
  link: string;
  email?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for insecure contexts / older browsers.
      const el = document.getElementById("activation-link") as HTMLInputElement | null;
      el?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-plum/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/60 bg-card p-6 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
              <Link2 className="h-5 w-5" />
              Vendor activation link
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send this one-time link to{" "}
              <span className="font-medium text-foreground">
                {email || "the vendor"}
              </span>{" "}
              (WhatsApp, SMS, email — any channel). They&rsquo;ll open it to set
              their password and reach their dashboard.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            id="activation-link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-lg border border-input bg-white/70 px-3 py-2 font-mono text-xs text-foreground"
          />
          <Button size="sm" onClick={copy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          For security this link is single-use and expires. If it stops working,
          click &ldquo;Activation link&rdquo; again to generate a fresh one.
        </p>
      </div>
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
      <dd className={`truncate font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
