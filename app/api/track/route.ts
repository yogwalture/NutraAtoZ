import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only these client-sent events are accepted (server-side events are inserted
 * directly). Keeps the endpoint from being used as an open write sink. */
const ALLOWED = new Set([
  "page_view",
  "product_view",
  "add_to_cart",
  "begin_checkout",
  "finder_complete",
  "goal_view",
]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(v: unknown, max = 300): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: Request) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ ok: true }); // silently no-op
  }
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = str(payload.event, 40);
  if (!event || !ALLOWED.has(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const productIdRaw = str(payload.productId, 40);
  const productId = productIdRaw && UUID_RE.test(productIdRaw) ? productIdRaw : null;

  // meta: only accept a small, primitive-valued object (no PII collected).
  let meta: Record<string, string | number | boolean> | null = null;
  if (payload.meta && typeof payload.meta === "object") {
    const entries = Object.entries(payload.meta as Record<string, unknown>)
      .filter(([, v]) => ["string", "number", "boolean"].includes(typeof v))
      .slice(0, 10)
      .map(([k, v]) => [
        k.slice(0, 40),
        typeof v === "string" ? v.slice(0, 120) : v,
      ]);
    if (entries.length) meta = Object.fromEntries(entries);
  }

  const { error } = await supabaseAdmin.from("analytics_events").insert({
    event,
    product_id: productId,
    goal: str(payload.goal, 60),
    path: str(payload.path, 200),
    session_id: str(payload.sessionId, 60),
    meta,
  });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
