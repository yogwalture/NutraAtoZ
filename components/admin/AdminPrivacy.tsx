"use client";

import * as React from "react";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserX,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import type { DataRequestRow } from "@/lib/privacy";
import { adminAnonymizeCustomer, adminDeleteCustomer } from "@/app/admin/actions";

export default function AdminPrivacy({ requests }: { requests: DataRequestRow[] }) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const formRef = React.useRef<HTMLFormElement>(null);

  function run(fn: (fd: FormData) => Promise<{ ok: boolean; error?: string; message?: string }>) {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    if (!email) {
      setMsg({ kind: "err", text: "Enter the customer's email first." });
      return;
    }
    setMsg(null);
    startTransition(async () => {
      const res = await fn(fd);
      setMsg(
        res.ok
          ? { kind: "ok", text: res.message || "Done." }
          : { kind: "err", text: res.error || "Something went wrong." }
      );
      if (res.ok) form.reset();
    });
  }

  function onDelete() {
    if (
      !confirm(
        "Permanently delete this customer's account and data? Order history is kept but anonymized. This cannot be undone."
      )
    )
      return;
    run(adminDeleteCustomer);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold text-primary">
          <ShieldCheck className="h-6 w-6" />
          Privacy &amp; data requests
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Honour a customer&apos;s data-revocation request. Anonymizing keeps an
          anonymized order history for accounting; deleting also removes their
          login and wellness data. Every action is logged below.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="email">Customer email</Label>
            <Input id="email" name="email" type="email" placeholder="customer@email.com" />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => run(adminAnonymizeCustomer)}
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
            Anonymize
          </Button>
          <Button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="border-destructive/30 bg-destructive text-white hover:opacity-90"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </div>
        {msg && (
          <p
            className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
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
      </form>

      <div>
        <h2 className="text-sm font-semibold text-foreground">Recent requests</h2>
        {requests.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border bg-white/50 px-4 py-8 text-center text-sm text-muted-foreground">
            No data requests logged yet.
          </p>
        ) : (
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-float backdrop-blur">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          r.kind === "DELETE"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {r.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {r.subject_email || r.subject_type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.requested_by || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
