import { getAllProducts } from "@/lib/adminData";
import ProductsModeration from "@/components/admin/ProductsModeration";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">
          Products moderation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"} across all
          vendors. Hide anything non-compliant.
        </p>
      </div>
      <ProductsModeration products={products} />
    </div>
  );
}
