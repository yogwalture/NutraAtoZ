"use client";

import * as React from "react";
import { track, type TrackPayload } from "@/lib/track";

/**
 * Fires a single analytics event once when mounted. Drop into any server
 * component (e.g. a product or goal page) to record a view without turning
 * the whole page into a client component.
 */
export default function TrackEvent({
  event,
  payload,
}: {
  event: string;
  payload?: TrackPayload;
}) {
  const fired = React.useRef(false);
  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, payload ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
