import SiteNav from "@/components/SiteNav";
import Hero from "@/components/Hero";
import CategoriesSection from "@/components/CategoriesSection";
import SupplementsSection from "@/components/SupplementsSection";
import Footer from "@/components/Footer";
import { getStoreProducts } from "@/lib/publicData";

export const revalidate = 30;

export default async function HomePage() {
  const products = await getStoreProducts(8);

  return (
    <div className="min-h-screen bg-gradient-to-b from-alabaster via-[hsl(48_30%_96%)] to-[hsl(168_24%_95%)]">
      <SiteNav />

      {/* pb-24 leaves room for the fixed mobile bottom bar */}
      <main className="pb-24 md:pb-0">
        <Hero />
        <CategoriesSection />
        <SupplementsSection products={products} />
        <Footer />
      </main>
    </div>
  );
}
