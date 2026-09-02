import { getVendorContext, getVendorProducts } from "@/lib/vendorData";
import BulkTools from "@/components/dashboard/BulkTools";
import SetupNotice from "@/components/dashboard/SetupNotice";
import type { ExportProduct } from "@/lib/bulk";

export const dynamic = "force-dynamic";

export default async function BulkPage() {
  const ctx = await getVendorContext();
  const products = ctx.vendorId ? await getVendorProducts(ctx.vendorId) : [];

  const exportRows: ExportProduct[] = products.map((p) => ({
    title: p.title,
    price: p.price,
    stock: p.stock,
    weight_gms: p.weight_gms,
    discount_type: p.discount_type,
    discount_value: p.discount_value,
    description: p.description,
    ingredients: p.ingredients,
    coa_status: p.coa_status,
    goals: p.goals,
    attributes: p.attributes,
  }));

  return (
    <div className="space-y-6">
      <SetupNotice configured={ctx.configured} hasVendor={!!ctx.vendor} />
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Bulk import &amp; export
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your catalogue in a spreadsheet — export what you have, or
          import many products at once.
        </p>
      </div>
      <BulkTools products={exportRows} />
    </div>
  );
}
