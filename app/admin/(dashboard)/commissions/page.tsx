import { getCommissionData } from "@/lib/adminData";
import CommissionPortal from "@/components/admin/CommissionPortal";

export default async function AdminCommissionsPage() {
  const data = await getCommissionData();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Commission portal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the platform commission, override it per vendor, and track earnings
          across the marketplace.
        </p>
      </div>
      <CommissionPortal data={data} />
    </div>
  );
}
