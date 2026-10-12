import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're offline — Nutraatoz",
  robots: { index: false, follow: false },
};

/**
 * Shown by the service worker when a navigation is attempted with no network.
 * Fully self-contained (no data fetching) so it renders from cache.
 */
export default function OfflinePage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)] px-6 text-center">
      <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-float backdrop-blur-xl">
        <img
          src="/nutraatoz-wordmark.png"
          alt="Nutraatoz"
          className="mx-auto h-9 w-auto"
        />
        <h1 className="mt-6 font-serif text-2xl font-semibold text-ink">
          You&rsquo;re offline
        </h1>
        <p className="mt-2 text-sm text-mist">
          It looks like you&rsquo;ve lost your connection. Check your network and
          try again — your cart and account are safe.
        </p>
        <a
          href="/"
          className="shine mt-6 inline-flex w-full items-center justify-center rounded-full bg-citrus-gradient px-6 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
        >
          Retry
        </a>
      </div>
    </div>
  );
}
