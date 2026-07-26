import { getVendorContext, getVendorProducts } from "@/lib/vendorData";
import ProductsManager from "@/components/dashboard/ProductsManager";
import SetupNotice from "@/components/dashboard/SetupNotice";

export default async function ProductsPage() {
  const ctx = await getVendorContext();
  const products = ctx.vendorId ? await getVendorProducts(ctx.vendorId) : [];

  return (
    <div className="space-y-5">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />
      <ProductsManager products={products} canEdit={!!ctx.vendorId} />
    </div>
  );
}
