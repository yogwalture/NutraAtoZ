import * as React from "react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: "emerald" | "gold" | "muted";
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "emerald",
}: StatCardProps) {
  const ring =
    accent === "gold"
      ? "bg-[hsl(41_60%_92%)] text-[hsl(35_72%_34%)]"
      : accent === "muted"
        ? "bg-muted text-muted-foreground"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-xl2 border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${ring}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-serif text-2xl font-semibold text-foreground">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
