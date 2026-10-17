import Link from "next/link";
import {
  Contact,
  PhoneCall,
  CalendarClock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  getAgentContext,
  getAgentStats,
  getAgentQueue,
} from "@/lib/agentData";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  LEAD: "New leads",
  CONTACTED: "Contacted",
  ONBOARDING: "Onboarding",
  LIVE: "Live",
  LOST: "Lost",
};

export default async function AgentHomePage() {
  const ctx = await getAgentContext();
  const scope = ctx.isAdmin ? null : ctx.userId;
  const [stats, queue] = await Promise.all([
    getAgentStats(scope),
    getAgentQueue(scope),
  ]);

  const cards = [
    { label: "Assigned leads", value: stats.total, icon: Contact, tone: "text-primary bg-primary/10" },
    { label: "Calls today", value: stats.callsToday, icon: PhoneCall, tone: "text-accent bg-accent/15" },
    { label: "Callbacks due", value: stats.callbacksDue, icon: CalendarClock, tone: "text-coral-700 bg-coral-500/10" },
    { label: "Onboarding", value: stats.byStage["ONBOARDING"] ?? 0, icon: TrendingUp, tone: "text-emerald-700 bg-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          {ctx.isAdmin ? "Team dashboard" : "Your day"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ctx.isAdmin
            ? "Overview across every agent and lead."
            : "Your assigned leads, calls and follow-ups at a glance."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${c.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-float backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
            <PhoneCall className="h-5 w-5" />
            Call queue — due today
          </h2>
          <Link
            href="/agent/queue"
            className="inline-flex items-center gap-1 text-sm font-medium text-coral-600 hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {queue.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing due right now. Nice work! 🎉
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {queue.slice(0, 6).map((l) => (
              <li key={l.id}>
                <Link
                  href={`/agent/leads/${l.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {l.company_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.contact_name || l.contact_phone || "—"} ·{" "}
                      {STAGE_LABEL[l.stage] ?? l.stage}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-coral-700">
                    {formatDate(l.next_follow_up_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Object.entries(STAGE_LABEL).map(([key, label]) => (
          <div
            key={key}
            className="rounded-xl border border-white/60 bg-white/60 p-4 text-center shadow-float backdrop-blur"
          >
            <p className="text-xl font-bold text-foreground">
              {stats.byStage[key] ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
