import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { variant: "success" | "warning" | "muted" | "danger"; label: string }> = {
  PAID: { variant: "success", label: "Paid" },
  CREATED: { variant: "warning", label: "Pending" },
  PENDING: { variant: "warning", label: "Pending" },
  FAILED: { variant: "danger", label: "Failed" },
  REFUNDED: { variant: "muted", label: "Refunded" },
  CANCELLED: { variant: "muted", label: "Cancelled" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = MAP[status?.toUpperCase()] ?? {
    variant: "muted" as const,
    label: status || "—",
  };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
