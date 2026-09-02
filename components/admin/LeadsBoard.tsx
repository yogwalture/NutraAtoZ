"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VendorLead, LeadStage } from "@/lib/adminData";
import {
  adminCreateLead,
  adminUpdateLead,
  adminSetLeadStage,
  adminDeleteLead,
} from "@/app/admin/actions";

const STAGES: { key: LeadStage; label: string; tone: string }[] = [
  { key: "LEAD", label: "Lead", tone: "bg-muted text-muted-foreground" },
  { key: "CONTACTED", label: "Contacted", tone: "bg-accent/15 text-accent" },
  { key: "ONBOARDING", label: "Onboarding", tone: "bg-primary/10 text-primary" },
  { key: "LIVE", label: "Live", tone: "bg-emerald-100 text-emerald-700" },
  { key: "LOST", label: "Lost", tone: "bg-destructive/10 text-destructive" },
];

export default function LeadsBoard({ leads }: { leads: VendorLead[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<VendorLead | null>(null);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setError(undefined);
    setOpen(true);
  }
  function openEdit(l: VendorLead) {
    setEditing(l);
    setError(undefined);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const res = editing
        ? await adminUpdateLead(editing.id, fd)
        : await adminCreateLead(fd);
      if (res.ok) setOpen(false);
      else setError(res.error ?? "Something went wrong.");
    });
  }

  function moveStage(l: VendorLead, stage: string) {
    setBusyId(l.id);
    startTransition(async () => {
      await adminSetLeadStage(l.id, stage);
      setBusyId(null);
    });
  }

  function remove(l: VendorLead) {
    if (!confirm(`Delete lead "${l.company_name}"?`)) return;
    setBusyId(l.id);
    startTransition(async () => {
      await adminDeleteLead(l.id);
      setBusyId(null);
    });
  }

  const counts = Object.fromEntries(
    STAGES.map((s) => [s.key, leads.filter((l) => l.stage === s.key).length])
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">
            Vendor pipeline
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {leads.length} prospect{leads.length === 1 ? "" : "s"} across the
            acquisition funnel.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add lead
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STAGES.map((stage) => (
          <div key={stage.key} className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stage.tone}`}>
                {stage.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {counts[stage.key]}
              </span>
            </div>
            <div className="flex-1 space-y-2 rounded-xl2 border border-border bg-secondary/30 p-2">
              {leads.filter((l) => l.stage === stage.key).length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No leads
                </p>
              ) : (
                leads
                  .filter((l) => l.stage === stage.key)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="rounded-lg border border-border bg-card p-3 shadow-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {l.company_name}
                        </p>
                        <div className="flex items-center gap-0.5">
                          <button
                            aria-label="Edit"
                            onClick={() => openEdit(l)}
                            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            aria-label="Delete"
                            onClick={() => remove(l)}
                            disabled={busyId === l.id && pending}
                            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            {busyId === l.id && pending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {l.contact_name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {l.contact_name}
                        </p>
                      )}
                      <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                        {l.contact_email && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {l.contact_email}
                          </p>
                        )}
                        {l.contact_phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 shrink-0" />
                            {l.contact_phone}
                          </p>
                        )}
                        {(l.city || l.state) && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {[l.city, l.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      {l.notes && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-foreground/70">
                          {l.notes}
                        </p>
                      )}
                      <select
                        value={l.stage}
                        onChange={(e) => moveStage(l, e.target.value)}
                        disabled={busyId === l.id && pending}
                        className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            Move to {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / edit modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="absolute inset-0" onClick={() => !pending && setOpen(false)} />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl2 border border-border bg-card shadow-card-hover sm:max-w-lg sm:rounded-xl2">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-primary">
                {editing ? "Edit lead" : "Add lead"}
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
                <Label htmlFor="company_name">Company / brand *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  required
                  defaultValue={editing?.company_name ?? ""}
                  placeholder="PureMarine Nutrition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact_name">Contact name</Label>
                  <Input id="contact_name" name="contact_name" defaultValue={editing?.contact_name ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stage">Stage</Label>
                  <select
                    id="stage"
                    name="stage"
                    defaultValue={editing?.stage ?? "LEAD"}
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input id="contact_email" name="contact_email" type="email" defaultValue={editing?.contact_email ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input id="contact_phone" name="contact_phone" defaultValue={editing?.contact_phone ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={editing?.city ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" defaultValue={editing?.state ?? ""} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" defaultValue={editing?.source ?? ""} placeholder="Referral, Instagram, expo…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={editing?.notes ?? ""} placeholder="Context, next steps, objections…" />
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
                  ) : editing ? (
                    "Save changes"
                  ) : (
                    "Add lead"
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
