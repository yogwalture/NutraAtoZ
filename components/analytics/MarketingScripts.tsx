import Script from "next/script";

/**
 * Injects third-party marketing/analytics base tags — Meta Pixel, Google
 * Analytics 4 and Google Ads — driven entirely by NEXT_PUBLIC_* env vars.
 * Nothing renders (and no network calls happen) unless an ID is configured,
 * so this is safe to keep mounted in the root layout at all times.
 */
export default function MarketingScripts() {
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID ?? "";
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  const ads = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
  const gtagId = ga4 || ads; // one loader serves both

  return (
    <>
      {/* Google Analytics 4 + Google Ads (gtag.js) */}
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${ga4 ? `gtag('config', '${ga4}');` : ""}
              ${ads ? `gtag('config', '${ads}');` : ""}
            `}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {pixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixel}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
