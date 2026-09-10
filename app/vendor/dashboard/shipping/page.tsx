import { getVendorContext } from "@/lib/vendorData";
import SetupNotice from "@/components/dashboard/SetupNotice";
import PickupForm from "@/components/dashboard/PickupForm";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const ctx = await getVendorContext();
  const v = ctx.vendor;

  return (
    <div className="space-y-6">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Shipping
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register the address your orders ship from. Shipments are booked
          through Shiprocket using this pickup location.
        </p>
      </div>

      <PickupForm
        defaults={{
          contact_person: v?.contact_person,
          contact_phone: v?.contact_phone,
          address_line: v?.address_line,
          city: v?.city,
          state: v?.state,
          pincode: v?.pincode,
        }}
        registered={!!v?.shiprocket_pickup_registered}
      />
    </div>
  );
}
