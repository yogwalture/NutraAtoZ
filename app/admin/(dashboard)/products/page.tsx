import { getAllProducts, getAllVendors } from "@/lib/adminData";
import AdminProducts from "@/components/admin/AdminProducts";

export default async function AdminProductsPage() {
  const [products, vendors] = await Promise.all([
    getAllProducts(),
    getAllVendors(),
  ]);

  const vendorOptions = vendors.map((v) => ({
    id: v.id,
    name: v.store_name || v.company_name || "Vendor",
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"} across all
          vendors. Add, edit, hide, or delete any listing.
        </p>
      </div>
      <AdminProducts products={products} vendors={vendorOptions} />
    </div>
  );
}
