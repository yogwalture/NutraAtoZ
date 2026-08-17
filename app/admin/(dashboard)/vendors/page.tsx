import { getAllVendors } from "@/lib/adminData";
import AdminVendors from "@/components/admin/AdminVendors";

export default async function AdminVendorsPage() {
  const vendors = await getAllVendors();
  const pending = vendors.filter((v) => !v.is_approved).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Vendors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, approve, or delete vendors and their full profiles.{" "}
          {pending > 0 && (
            <span className="font-medium text-accent">
              {pending} awaiting review.
            </span>
          )}
        </p>
      </div>
      <AdminVendors vendors={vendors} />
    </div>
  );
}
