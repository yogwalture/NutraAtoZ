import type { MetadataRoute } from "next";

const SITE_URL = "https://nutraatoz.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/vendor/dashboard",
          "/vendor/login",
          "/api/",
          "/account",
          "/checkout",
          "/cart",
          "/login",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
