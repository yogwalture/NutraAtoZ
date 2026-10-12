import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes Nutraatoz installable as an app on desktop,
 * Android/Chrome, and iOS (Add to Home Screen). Next serves this at
 * /manifest.webmanifest and auto-links it in <head>.
 *
 * Colors match the live storefront theme (globals.css):
 *   background cream #FFF8F0, primary coral #FF6B4A.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nutraatoz — Verified Nutraceuticals",
    short_name: "Nutraatoz",
    description:
      "India's curated marketplace for FSSAI-verified nutraceuticals and supplements — shop by wellness goal with documented ingredients and Certificate of Analysis on request.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#FFF8F0",
    theme_color: "#FF6B4A",
    lang: "en-IN",
    dir: "ltr",
    categories: ["shopping", "health", "lifestyle", "medical"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shop supplements",
        short_name: "Shop",
        url: "/products?source=pwa",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Wellness Scan",
        short_name: "Scan",
        url: "/wellness-scan?source=pwa",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "My cart",
        short_name: "Cart",
        url: "/cart?source=pwa",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
