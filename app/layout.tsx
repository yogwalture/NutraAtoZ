import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import MarketingScripts from "@/components/analytics/MarketingScripts";

const SITE_URL = "https://nutraatoz.com";
const SITE_NAME = "Nutraatoz";
const SITE_DESC =
  "India's curated marketplace for FSSAI-verified nutraceuticals and supplements — shop by wellness goal, with documented ingredients and Certificate of Analysis on request.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Nutraatoz — Verified Nutraceutical Marketplace",
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "nutraceuticals",
    "supplements India",
    "FSSAI verified supplements",
    "vitamins",
    "protein",
    "omega-3",
    "ashwagandha",
    "wellness marketplace",
    "buy supplements online India",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Nutraatoz — Verified Nutraceutical Marketplace",
    description: SITE_DESC,
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Nutraatoz — Verified Nutraceutical Marketplace" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutraatoz — Verified Nutraceutical Marketplace",
    description: SITE_DESC,
    images: ["/og.png"],
  },
  icons: { icon: "/icon.png" },
  category: "shopping",
  verification: {
    google: "oJk-CwHguQL17zRyDjEWmuKkOq_AvQ6nLf5Wk55sDbA",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/nutraatoz-logo.png`,
  email: "nutraatoz@gmail.com",
  sameAs: [
    "https://www.instagram.com/nutraatoz/",
    "https://www.facebook.com/nutraatoz",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <MarketingScripts />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
