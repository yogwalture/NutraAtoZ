"use client";

import * as React from "react";
import {
  Percent,
  Loader2,
  Check,
  IndianRupee,
  CircleDollarSign,
  Wallet,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/format";
import type { CommissionData } from "@/lib/adminData";
import {
  setPlatformCommission,
  setVendorCommission,
  applyVendorCommissionToProducts,
} from "@/app/admin/actions";

export default function CommissionPortal({ data }: { data: CommissionData }) {
  const [pending, startTransition] = React.useTransition();
  const [defaultPct, setDefaultPct] = React.useState(String(data.defaultCommission));
  const [savedDefault, setSavedDefault] = React.useState(false);
  const [rows, setRows] = React.useState(
    () =>
      new Map(
        data.vendors.map((v) => [
          v.id,
          v.commission_pct != null ? String(v.commission_pct) : "",
        ])
      )
  );
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);

  function saveDefault() {
    startTransition(async () => {
      const res = await setPlatformCommission(Number(defaultPct));
      if (res.ok) {
        setSavedDefault(true);
        window.setTimeout(() => setSavedDefault(false), 1500);
      } else setNote(res.error ?? "Failed");
    });
  }

  function saveVendor(id: string) {
    const raw = rows.get(id) ?? "";
    const pct = raw.trim() === "" ? null : Number(raw);
    setBusyId(id + ":save");
    startTransition(async () => {
      const res = await setVendorCommission(id, pct);
      setBusyId(null);
      setNote(res.ok ? "Vendor commission updated." : res.error ?? "Failed");
      window.setTimeout(() => setNote(null), 2000);
    });
  }

  function applyToProducts(id: string) {
    const raw = rows.get(id) ?? "";
    const pct = raw.trim() === "" ? data.defaultCommission : Number(raw);
    if (!confirm(`Apply ${pct}% commission to every product of this vendor?`)) return;
    setBusyId(id + ":apply");
    startTransition(async () => {
      const res = await applyVendorCommissionToProducts(id, pct);
      setBusyId(null);
      setNote(res.ok ? "Applied to all products." : res.error ?? "Failed");
      window.setTimeout(() => setNote(null), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Earnings summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Gross sales" value={formatINR(data.totalGmv)} icon={IndianRupee} />
        <Stat label="Commission earned" value={formatINR(data.totalCommission)} icon={CircleDollarSign} accent />
        <Stat label="Vendor payouts" value={formatINR(data.totalPayout)} icon={Wallet} />
        <Stat label="Active vendors" value={String(data.vendors.length)} icon={Layers} />
      </div>

      {/* Global default */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-float backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
              <Percent className="h-5 w-5" />
              Platform default commission
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Applied to vendors without their own commission override.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div className="w-28">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={defaultPct}
                onChange={(e) => setDefaultPct(e.target.value)}
              />
            </div>
            <Button onClick={saveDefault} disabled={pending}>
              {savedDefault ? <Check className="h-4 w-4" /> : null}
              {savedDefault ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Per-vendor commission */}
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-float backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-3.5">
          <h2 className="font-serif text-base font-semibold text-primary">
            Vendor commissions &amp; earnings
          </h2>
          {note && <span className="text-xs font-medium text-accent">{note}</span>}
        </div>
        {data.vendors.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No vendors yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-white/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3 text-center">Products</th>
                  <th className="px-5 py-3 text-right">Sales</th>
                  <th className="px-5 py-3 text-right">Commission</th>
                  <th className="px-5 py-3 text-right">Payout</th>
                  <th className="px-5 py-3">Rate %</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {data.vendors.map((v) => {
                  const saving = busyId === v.id + ":save" && pending;
                  const applying = busyId === v.id + ":apply" && pending;
                  return (
                    <tr key={v.id} className="hover:bg-primary/[0.02]">
                      <td className="px-5 py-3 font-medium text-foreground">{v.name}</td>
                      <td className="px-5 py-3 text-center text-muted-foreground">{v.products}</td>
                      <td className="px-5 py-3 text-right text-foreground">{formatINR(v.gmv)}</td>
                      <td className="px-5 py-3 text-right font-medium text-primary">{formatINR(v.commission)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{formatINR(v.payout)}</td>
                      <td className="px-5 py-3">
                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder={`${data.defaultCommission}`}
                            value={rows.get(v.id) ?? ""}
                            onChange={(e) => {
                              const next = new Map(rows);
                              next.set(v.id, e.target.value);
                              setRows(next);
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => saveVendor(v.id)} disabled={saving}>
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => applyToProducts(v.id)} disabled={applying}>
                            {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply to products"}
                          </Button>
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
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-float backdrop-blur">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            accent ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 font-serif text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
