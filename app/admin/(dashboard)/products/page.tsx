import { getAllProducts, getAllVendors } from "@/lib/adminData";
import ProductsModeration from "@/components/admin/ProductsModeration";
import AddProduct from "@/components/admin/AddProduct";

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">
            Products moderation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"} across all
            vendors. Add products or hide anything non-compliant.
          </p>
        </div>
        <AddProduct vendors={vendorOptions} />
      </div>
      <ProductsModeration products={products} />
    </div>
  );
}
