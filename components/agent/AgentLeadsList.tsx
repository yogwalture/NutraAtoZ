"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  CalendarClock,
  ArrowRight,
  UserPlus,
  Tag,
} from "lucide-react";
import type { AgentLead } from "@/lib/agentData";
import { formatDate } from "@/lib/format";
import { claimLead } from "@/app/agent/actions";

const STAGE_TONE: Record<string, string> = {
  LEAD: "bg-muted text-muted-foreground",
  CONTACTED: "bg-accent/15 text-accent",
  ONBOARDING: "bg-primary/10 text-primary",
  LIVE: "bg-emerald-100 text-emerald-700",
  LOST: "bg-destructive/10 text-destructive",
};

export default function AgentLeadsList({
  leads,
  emptyLabel = "No leads here.",
  showClaim = false,
}: {
  leads: AgentLead[];
  emptyLabel?: string;
  showClaim?: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  function claim(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await claimLead(id);
      setBusyId(null);
    });
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/50 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {leads.map((l) => (
        <div
          key={l.id}
          className="flex flex-col rounded-2xl border border-white/60 bg-white/70 p-4 shadow-float backdrop-blur"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{l.company_name}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                STAGE_TONE[l.stage] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {l.stage}
            </span>
          </div>
          {l.contact_name && (
            <p className="mt-0.5 text-xs text-muted-foreground">{l.contact_name}</p>
          )}

          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {l.contact_phone && (
              <a
                href={`tel:${l.contact_phone}`}
                className="flex w-fit items-center gap-1.5 font-medium text-coral-700 hover:underline"
              >
                <Phone className="h-3 w-3 shrink-0" />
                {l.contact_phone}
              </a>
            )}
            {l.contact_email && (
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                {l.contact_email}
              </p>
            )}
            {(l.city || l.state) && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {[l.city, l.state].filter(Boolean).join(", ")}
              </p>
            )}
            {l.product_category && (
              <p className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 shrink-0" />
                {l.product_category}
              </p>
            )}
            {l.next_follow_up_at && (
              <p className="flex items-center gap-1.5 text-coral-700">
                <CalendarClock className="h-3 w-3 shrink-0" />
                Follow up {formatDate(l.next_follow_up_at)}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            {showClaim && !l.assigned_agent_id && (
              <button
                onClick={() => claim(l.id)}
                disabled={pending && busyId === l.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-white/70 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {pending && busyId === l.id ? "Claiming…" : "Claim"}
              </button>
            )}
            <Link
              href={`/agent/leads/${l.id}`}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-coral-600 hover:underline"
            >
              Open workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
