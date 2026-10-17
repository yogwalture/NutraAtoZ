"use client";

import * as React from "react";
import {
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Headphones,
  Link2,
  Copy,
  Trash2,
  Contact,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AgentSummary } from "@/lib/agentData";
import {
  createAgent,
  getAgentActivationLink,
  deleteAgent,
} from "@/app/admin/actions";

interface AgentRow extends AgentSummary {
  leadCount: number;
}

export default function AgentsManager({ agents }: { agents: AgentRow[] }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [linkModal, setLinkModal] = React.useState<{
    link: string;
    email?: string;
    note?: string;
  } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const res = await createAgent(fd);
      if (!res.ok) {
        setError(res.error ?? "Could not create the agent.");
        return;
      }
      formRef.current?.reset();
      if (res.activationLink) {
        setLinkModal({
          link: res.activationLink,
          email: res.vendorEmail,
          note: res.message,
        });
      }
    });
  }

  function reissue(a: AgentRow) {
    if (!a.email) return;
    setBusyId(a.id);
    startTransition(async () => {
      const res = await getAgentActivationLink(a.email!, a.full_name ?? undefined);
      setBusyId(null);
      if (!res.ok || !res.activationLink) {
        alert(res.error || "Could not generate a link.");
        return;
      }
      setLinkModal({
        link: res.activationLink,
        email: res.vendorEmail,
        note: res.message,
      });
    });
  }

  function remove(a: AgentRow) {
    if (
      !confirm(
        `Remove agent "${a.full_name || a.email}"? Their assigned leads will be unassigned.`
      )
    )
      return;
    setBusyId(a.id);
    startTransition(async () => {
      const res = await deleteAgent(a.id);
      setBusyId(null);
      if (!res.ok && res.error) alert(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold text-primary">
          <Headphones className="h-6 w-6" />
          Telecalling agents
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create agent logins, share activation links and manage the acquisition
          team.
        </p>
      </div>

      {/* Create agent */}
      <form
        ref={formRef}
        onSubmit={onCreate}
        className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur"
      >
        <h2 className="text-sm font-semibold text-foreground">Add an agent</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Name</Label>
            <Input id="full_name" name="full_name" placeholder="Agent name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required placeholder="agent@nutraatoz.com" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Create &amp; invite
          </Button>
        </div>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </form>

      {/* Agent list */}
      {agents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No agents yet. Add your first agent above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((a) => {
            const rowBusy = busyId === a.id && pending;
            return (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-float backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Headphones className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {a.full_name || "Unnamed agent"}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                    <Contact className="h-3 w-3" />
                    {a.leadCount} lead{a.leadCount === 1 ? "" : "s"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reissue(a)}
                    disabled={rowBusy}
                  >
                    {rowBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    Activation link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => remove(a)}
                    disabled={rowBusy}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {linkModal && (
        <LinkModal
          link={linkModal.link}
          email={linkModal.email}
          note={linkModal.note}
          onClose={() => setLinkModal(null)}
        />
      )}
    </div>
  );
}

function LinkModal({
  link,
  email,
  note,
  onClose,
}: {
  link: string;
  email?: string;
  note?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.getElementById("agent-link") as HTMLInputElement | null;
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
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
          <Link2 className="h-5 w-5" />
          Agent activation link
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          A one-time link for{" "}
          <span className="font-medium text-foreground">{email || "the agent"}</span>{" "}
          to set their password and reach the agent portal.
        </p>
        {note && (
          <p
            className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
              /emailed to/i.test(note)
                ? "bg-primary/10 text-coral-700"
                : "bg-accent/10 text-accent"
            }`}
          >
            {/emailed to/i.test(note) && <CheckCircle2 className="h-3.5 w-3.5" />}
            {note}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <input
            id="agent-link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-lg border border-input bg-white/70 px-3 py-2 font-mono text-xs text-foreground"
          />
          <Button size="sm" onClick={copy}>
            {copied ? <Check /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return <CheckCircle2 className="h-4 w-4" />;
}
