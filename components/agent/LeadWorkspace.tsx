"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  PhoneCall,
  CalendarClock,
  History,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Link2,
  Copy,
  Store,
  PackagePlus,
  Send,
  UserCheck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AgentLead, CallLog } from "@/lib/agentData";
import { formatDate } from "@/lib/format";
import {
  logCall,
  agentSetLeadStage,
  setFollowUp,
  sendRegistrationLink,
  convertLeadToVendor,
  agentAddProduct,
} from "@/app/agent/actions";

const STAGES = [
  { key: "LEAD", label: "Lead" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "ONBOARDING", label: "Onboarding" },
  { key: "LIVE", label: "Live" },
  { key: "LOST", label: "Lost" },
];

const DISPOSITIONS = [
  { key: "CONNECTED", label: "Connected" },
  { key: "INTERESTED", label: "Interested" },
  { key: "CALLBACK", label: "Asked to call back" },
  { key: "NO_ANSWER", label: "No answer" },
  { key: "BUSY", label: "Busy" },
  { key: "VOICEMAIL", label: "Left voicemail" },
  { key: "NOT_INTERESTED", label: "Not interested" },
  { key: "WRONG_NUMBER", label: "Wrong number" },
];

const DISPO_LABEL = Object.fromEntries(DISPOSITIONS.map((d) => [d.key, d.label]));

const STAGE_TONE: Record<string, string> = {
  LEAD: "bg-muted text-muted-foreground",
  CONTACTED: "bg-accent/15 text-accent",
  ONBOARDING: "bg-primary/10 text-primary",
  LIVE: "bg-emerald-100 text-emerald-700",
  LOST: "bg-destructive/10 text-destructive",
};

export default function LeadWorkspace({
  lead,
  calls,
}: {
  lead: AgentLead;
  calls: CallLog[];
}) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [shareLink, setShareLink] = React.useState<string | null>(null);
  const [converted, setConverted] = React.useState<boolean>(
    !!lead.converted_vendor_id
  );
  const [showRegForm, setShowRegForm] = React.useState(false);

  const callFormRef = React.useRef<HTMLFormElement>(null);
  const productFormRef = React.useRef<HTMLFormElement>(null);

  function flash(kind: "ok" | "err", text: string) {
    setMsg({ kind, text });
  }

  function onLogCall(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await logCall(lead.id, fd);
      if (res.ok) {
        flash("ok", res.message || "Call logged.");
        callFormRef.current?.reset();
      } else flash("err", res.error || "Could not log the call.");
    });
  }

  function onStage(stage: string) {
    startTransition(async () => {
      const res = await agentSetLeadStage(lead.id, stage);
      if (!res.ok) flash("err", res.error || "Could not update stage.");
    });
  }

  function onFollowUp(value: string) {
    startTransition(async () => {
      const res = await setFollowUp(lead.id, value || null);
      flash(
        res.ok ? "ok" : "err",
        res.ok ? "Follow-up updated." : res.error || "Could not set follow-up."
      );
    });
  }

  function onSendRegLink() {
    startTransition(async () => {
      const res = await sendRegistrationLink(lead.id);
      if (res.ok) {
        setShareLink(res.link || null);
        flash("ok", res.message || "Registration link ready.");
      } else flash("err", res.error || "Could not create the link.");
    });
  }

  function onConvert(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await convertLeadToVendor(lead.id, fd);
      if (res.ok) {
        setConverted(true);
        setShowRegForm(false);
        flash("ok", res.message || "Vendor created.");
      } else flash("err", res.error || "Could not create the vendor.");
    });
  }

  function onAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await agentAddProduct(lead.id, fd);
      if (res.ok) {
        flash("ok", res.message || "Product added.");
        productFormRef.current?.reset();
      } else flash("err", res.error || "Could not add the product.");
    });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash("ok", "Link copied to clipboard.");
    } catch {
      flash("err", "Couldn't copy — select and copy manually.");
    }
  }

  const followUpLocal = lead.next_follow_up_at
    ? toLocalInput(lead.next_follow_up_at)
    : "";

  return (
    <div className="space-y-5">
      <Link
        href="/agent/leads"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-primary">
                {lead.company_name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  STAGE_TONE[lead.stage] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {lead.stage}
              </span>
            </div>
            {lead.contact_name && (
              <p className="mt-1 text-sm text-muted-foreground">{lead.contact_name}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {lead.contact_email && (
                <a
                  href={`mailto:${lead.contact_email}`}
                  className="flex items-center gap-1.5 hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {lead.contact_email}
                </a>
              )}
              {(lead.city || lead.state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {[lead.city, lead.state].filter(Boolean).join(", ")}
                </span>
              )}
              {lead.product_category && (
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {lead.product_category}
                </span>
              )}
              {lead.source && (
                <span className="rounded-full bg-secondary px-2 py-0.5">
                  via {lead.source}
                </span>
              )}
            </div>
          </div>

          {lead.contact_phone && (
            <a
              href={`tel:${lead.contact_phone}`}
              className="inline-flex items-center gap-2 rounded-xl bg-citrus-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow-coral transition-transform hover:scale-[1.02]"
            >
              <PhoneCall className="h-5 w-5" />
              Call {lead.contact_phone}
            </a>
          )}
        </div>
        {lead.message && (
          <p className="mt-3 rounded-lg bg-secondary/60 px-3 py-2 text-sm text-foreground/80">
            “{lead.message}”
          </p>
        )}
      </div>

      {msg && (
        <p
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
            msg.kind === "ok"
              ? "bg-primary/10 text-coral-700"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {msg.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {msg.text}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: telecalling */}
        <div className="space-y-5 lg:col-span-2">
          {/* Log a call */}
          <section className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
              <Phone className="h-5 w-5" />
              Log a call
            </h2>
            <form ref={callFormRef} onSubmit={onLogCall} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="disposition">Outcome *</Label>
                  <select
                    id="disposition"
                    name="disposition"
                    required
                    defaultValue=""
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>
                      Select outcome…
                    </option>
                    {DISPOSITIONS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="callback_at">Schedule callback</Label>
                  <Input
                    id="callback_at"
                    name="callback_at"
                    type="datetime-local"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="What was discussed, objections, next steps…"
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4" />
                    Log call
                  </>
                )}
              </Button>
            </form>
          </section>

          {/* Call history */}
          <section className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
              <History className="h-5 w-5" />
              Call history
              <span className="text-sm font-normal text-muted-foreground">
                ({calls.length})
              </span>
            </h2>
            {calls.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No calls logged yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {calls.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {DISPO_LABEL[c.disposition] ?? c.disposition}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    {c.notes && (
                      <p className="mt-1 text-foreground/75">{c.notes}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {c.agent_email && <span>by {c.agent_email}</span>}
                      {c.callback_at && (
                        <span className="text-coral-700">
                          callback {formatDate(c.callback_at)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: pipeline + conversion */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur">
            <h2 className="font-serif text-lg font-semibold text-primary">Pipeline</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="stage">Stage</Label>
                <select
                  id="stage"
                  defaultValue={lead.stage}
                  onChange={(e) => onStage(e.target.value)}
                  disabled={pending}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="followup">
                  <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
                  Next follow-up
                </Label>
                <Input
                  id="followup"
                  type="datetime-local"
                  defaultValue={followUpLocal}
                  onChange={(e) => onFollowUp(e.target.value)}
                  disabled={pending}
                />
              </div>
            </div>
          </section>

          {/* Conversion */}
          <section className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
              <Store className="h-5 w-5" />
              Convert to vendor
            </h2>

            {converted ? (
              <div className="mt-3 space-y-4">
                <p className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
                  <UserCheck className="h-4 w-4 shrink-0" />
                  Vendor created — pending admin verification.
                </p>

                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <PackagePlus className="h-4 w-4" />
                    Add a product
                  </h3>
                  <form
                    ref={productFormRef}
                    onSubmit={onAddProduct}
                    className="mt-2 space-y-3"
                  >
                    <Input name="title" required placeholder="Product title *" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="Price (₹) *"
                      />
                      <Input
                        name="stock"
                        type="number"
                        min="0"
                        placeholder="Stock"
                      />
                      <Input
                        name="commission_pct"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="Commission %"
                      />
                      <Input
                        name="weight_gms"
                        type="number"
                        min="0"
                        placeholder="Weight (g)"
                      />
                    </div>
                    <Textarea name="description" placeholder="Short description" />
                    <Textarea name="ingredients" placeholder="Key ingredients" />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Main product image
                      </label>
                      <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Label / nutrition images
                      </label>
                      <input
                        name="gallery"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                    <Button type="submit" variant="outline" disabled={pending}>
                      {pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding…
                        </>
                      ) : (
                        <>
                          <PackagePlus className="h-4 w-4" />
                          Add product
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send the vendor a self-serve link, or register on their behalf.
                </p>

                <Button onClick={onSendRegLink} disabled={pending} className="w-full">
                  <Send className="h-4 w-4" />
                  Send registration link
                </Button>

                {shareLink && (
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={shareLink}
                      onFocus={(e) => e.currentTarget.select()}
                      className="flex-1 rounded-lg border border-input bg-white/70 px-2.5 py-2 font-mono text-[11px] text-foreground"
                    />
                    <Button size="sm" variant="outline" onClick={() => copy(shareLink)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowRegForm((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-coral-600 hover:underline"
                >
                  <Link2 className="h-4 w-4" />
                  {showRegForm ? "Hide" : "Register on their behalf"}
                </button>

                {showRegForm && (
                  <form onSubmit={onConvert} className="space-y-3 border-t border-border pt-3">
                    <Input
                      name="company_name"
                      defaultValue={lead.company_name}
                      placeholder="Legal / company name *"
                      required
                    />
                    <Input
                      name="store_name"
                      defaultValue={lead.company_name}
                      placeholder="Store / brand name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="contact_person"
                        defaultValue={lead.contact_name ?? ""}
                        placeholder="Contact person"
                      />
                      <Input
                        name="contact_phone"
                        defaultValue={lead.contact_phone ?? ""}
                        placeholder="Phone"
                      />
                    </div>
                    <Input
                      name="contact_email"
                      type="email"
                      defaultValue={lead.contact_email ?? ""}
                      placeholder="Email"
                    />
                    <Input name="address_line" placeholder="Address" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input name="city" defaultValue={lead.city ?? ""} placeholder="City" />
                      <Input name="state" defaultValue={lead.state ?? ""} placeholder="State" />
                      <Input name="pincode" placeholder="Pincode" />
                      <Input name="gstin" placeholder="GSTIN" />
                      <Input name="pan" placeholder="PAN" />
                      <Input name="fssai_license_no" placeholder="FSSAI no." />
                    </div>
                    <Button type="submit" disabled={pending} className="w-full">
                      {pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <Store className="h-4 w-4" />
                          Create vendor
                        </>
                      )}
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      An admin verifies GSTIN/FSSAI and approves before the store
                      goes live.
                    </p>
                  </form>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/** Convert an ISO timestamp to a value usable by <input type="datetime-local">. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
