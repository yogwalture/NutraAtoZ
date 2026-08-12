import { getAllVendors } from "@/lib/adminData";
import VendorApprovals from "@/components/admin/VendorApprovals";

export default async function AdminVendorsPage() {
  const vendors = await getAllVendors();
  const pending = vendors.filter((v) => !v.is_approved).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Vendor approvals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review FSSAI, GSTIN, and bank details, then approve or reject.{" "}
          {pending > 0 && (
            <span className="font-medium text-accent">
              {pending} awaiting review.
            </span>
          )}
        </p>
      </div>
      <VendorApprovals vendors={vendors} />
    </div>
  );
}
