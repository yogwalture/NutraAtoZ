"use client";

/**
 * Client bridge to third-party marketing pixels (Meta Pixel, GA4, Google Ads).
 * All IDs are read from NEXT_PUBLIC_* env vars and injected by
 * <MarketingScripts/>. When an ID is absent, the corresponding calls no-op.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
export const GOOGLE_ADS_PURCHASE_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL ?? "";

export type MarketingEvent =
  | "product_view"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase";

interface MarketingParams {
  value?: number;
  currency?: string;
  productId?: string;
  transactionId?: string;
}

/** Fire a funnel event to whichever pixels are configured. Safe if none are. */
export function fireMarketing(event: MarketingEvent, params: MarketingParams = {}) {
  if (typeof window === "undefined") return;
  const currency = params.currency ?? "INR";
  const fbq = window.fbq;
  const gtag = window.gtag;

  try {
    switch (event) {
      case "product_view":
        fbq?.("track", "ViewContent", { content_ids: params.productId ? [params.productId] : undefined });
        gtag?.("event", "view_item", { currency, value: params.value });
        break;
      case "add_to_cart":
        fbq?.("track", "AddToCart", { content_ids: params.productId ? [params.productId] : undefined });
        gtag?.("event", "add_to_cart", { currency, value: params.value });
        break;
      case "begin_checkout":
        fbq?.("track", "InitiateCheckout");
        gtag?.("event", "begin_checkout", { currency, value: params.value });
        break;
      case "purchase":
        fbq?.("track", "Purchase", { value: params.value, currency });
        gtag?.("event", "purchase", {
          currency,
          value: params.value,
          transaction_id: params.transactionId,
        });
        if (GOOGLE_ADS_ID && GOOGLE_ADS_PURCHASE_LABEL) {
          gtag?.("event", "conversion", {
            send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`,
            value: params.value,
            currency,
            transaction_id: params.transactionId,
          });
        }
        break;
    }
  } catch {
    /* marketing must never break the page */
  }
}
