import { Info } from "lucide-react";

/** Shown when Supabase isn't configured or no vendor is resolved. */
export default function SetupNotice({
  configured,
  hasVendor,
}: {
  configured: boolean;
  hasVendor: boolean;
}) {
  if (configured && hasVendor) return null;

  const message = !configured
    ? "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local to load live data."
    : "No vendor resolved. Set DEMO_VENDOR_ID in .env.local (or a vendor_id cookie) to a row in your vendors table.";

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-[hsl(41_60%_80%)] bg-[hsl(41_70%_95%)] px-4 py-3">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(35_72%_38%)]" />
      <div className="text-sm">
        <p className="font-medium text-[hsl(35_72%_30%)]">
          Showing the dashboard shell with empty data
        </p>
        <p className="mt-0.5 text-[hsl(35_30%_38%)]">{message}</p>
      </div>
    </div>
  );
}
