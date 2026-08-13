import SiteNav from "@/components/SiteNav";
import Hero from "@/components/Hero";
import MarqueeBar from "@/components/MarqueeBar";
import CategoriesSection from "@/components/CategoriesSection";
import SupplementsSection from "@/components/SupplementsSection";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { getStoreProducts } from "@/lib/publicData";

export const revalidate = 30;

export default async function HomePage() {
  const products = await getStoreProducts(8);

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />

      {/* pb-24 leaves room for the fixed mobile bottom bar */}
      <main className="pb-24 md:pb-0">
        <Hero />
        <MarqueeBar />
        <CategoriesSection />
        <SupplementsSection products={products} />
        <CtaBand />
        <Footer />
      </main>
    </div>
  );
}
