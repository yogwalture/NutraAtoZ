"use client";

/**
 * Lightweight first-party analytics client. Fires small, PII-free events to
 * /api/track. Uses sendBeacon when available so it doesn't block navigation.
 */

export type TrackPayload = {
  productId?: string;
  goal?: string;
  path?: string;
  sessionId?: string;
  meta?: Record<string, string | number | boolean>;
};

/** A per-browser, non-identifying session id (random, stored locally). */
function sessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const KEY = "naz_sid";
    let sid = localStorage.getItem(KEY);
    if (!sid) {
      sid =
        (crypto?.randomUUID?.() as string) ||
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return undefined;
  }
}

export function track(event: string, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    event,
    path: payload.path ?? window.location.pathname,
    sessionId: payload.sessionId ?? sessionId(),
    productId: payload.productId,
    goal: payload.goal,
    meta: payload.meta,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* analytics must never break the page */
  }
}
