"use client";

import * as React from "react";
import { Download, X, Share, Plus, Smartphone } from "lucide-react";

/**
 * Progressive Web App glue:
 *  - registers the service worker (/sw.js)
 *  - shows a branded "Install app" button when the browser fires
 *    `beforeinstallprompt` (Chrome/Edge/Android/desktop)
 *  - shows Add-to-Home-Screen instructions on iOS Safari, which has no
 *    install event
 *  - hides itself once the app is installed / running standalone
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWA() {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [isIos, setIsIos] = React.useState(false);
  const [showIosSheet, setShowIosSheet] = React.useState(false);

  React.useEffect(() => {
    // 1) Register the service worker.
    if ("serviceWorker" in navigator) {
      const onLoad = () =>
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }

    // 2) Already installed / standalone? Then never show the prompt.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari exposes navigator.standalone
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (standalone) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(ios);

    const dismissed = (() => {
      try {
        return localStorage.getItem("pwa-install-dismissed") === "1";
      } catch {
        return false;
      }
    })();

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      try {
        localStorage.removeItem("pwa-install-dismissed");
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS has no beforeinstallprompt — offer the manual button instead.
    if (ios && !dismissed) setVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (isIos) {
      setShowIosSheet(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem("pwa-install-dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Floating install pill — sits above the mobile bottom bar */}
      <div className="fixed bottom-24 right-4 z-[60] flex items-center gap-1 md:bottom-6">
        <button
          onClick={handleInstall}
          aria-label="Install the Nutraatoz app"
          className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-5 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
        >
          <Download className="h-4 w-4" strokeWidth={2.5} />
          Install app
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-ink/60 shadow-card backdrop-blur transition-colors hover:text-coral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* iOS Add-to-Home-Screen instructions */}
      {showIosSheet && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-plum/40 backdrop-blur-sm sm:items-center"
          onClick={() => setShowIosSheet(false)}
        >
          <div
            className="m-3 w-full max-w-sm rounded-3xl border border-white/60 bg-cream p-6 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
                <Smartphone className="h-5 w-5 text-coral-600" />
                Install Nutraatoz
              </span>
              <button
                aria-label="Close"
                onClick={() => setShowIosSheet(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-coral/10 hover:text-coral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-mist">
              Add Nutraatoz to your Home Screen for a full-screen, app-like
              experience:
            </p>
            <ol className="mt-4 space-y-3 text-sm text-ink/80">
              <li className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coral/10 text-xs font-bold text-coral-700">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Tap the <Share className="h-4 w-4 text-coral-600" /> Share
                  button in Safari
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coral/10 text-xs font-bold text-coral-700">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Choose <Plus className="h-4 w-4 text-coral-600" /> &ldquo;Add
                  to Home Screen&rdquo;
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coral/10 text-xs font-bold text-coral-700">
                  3
                </span>
                <span>Tap &ldquo;Add&rdquo; — done!</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
