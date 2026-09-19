import type { MetadataRoute } from "next";
import { GOALS } from "@/lib/goals";
import { getStoreProducts } from "@/lib/publicData";

const SITE_URL = "https://nutraatoz.com";

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/products", priority: 0.9 },
    { path: "/wellness-scan", priority: 0.8 },
    { path: "/goals", priority: 0.8 },
    { path: "/finder", priority: 0.7 },
    { path: "/sell-on-nutraatoz", priority: 0.7 },
    { path: "/about", priority: 0.4 },
    { path: "/contact", priority: 0.4 },
    { path: "/faq", priority: 0.4 },
    { path: "/shipping", priority: 0.3 },
    { path: "/returns", priority: 0.3 },
    { path: "/lab-reports", priority: 0.4 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
    { path: "/vendor-agreement", priority: 0.2 },
    { path: "/vendor-terms", priority: 0.2 },
    { path: "/vendor/onboarding", priority: 0.5 },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((s) => ({
    url: `${SITE_URL}${s.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: s.priority,
  }));

  for (const g of GOALS) {
    entries.push({
      url: `${SITE_URL}/goals/${g.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  try {
    const products = await getStoreProducts(500);
    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/product/${p.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // If products can't be read, the static + goal URLs still ship.
  }

  return entries;
}
