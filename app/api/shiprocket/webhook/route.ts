import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { mapShiprocketStatus, trackingUrl } from "@/lib/shiprocket";

export const runtime = "nodejs";

/**
 * Shiprocket status webhook. Configure in the Shiprocket dashboard
 * (Settings → API → Webhooks) with:
 *   URL   : https://nutraatoz.com/api/shiprocket/webhook
 *   Token : the value of SHIPROCKET_WEBHOOK_TOKEN (sent back as the
 *           `x-api-key` header on every call)
 *
 * IMPORTANT: webhook providers (Shiprocket included) verify the endpoint by
 * pinging it and treating any non-2xx response as "endpoint unreachable", which
 * blocks saving the webhook. So this route ALWAYS returns 200 — both for the
 * GET reachability check and for POSTs. Security is preserved by only *acting*
 * on the payload (updating an order) when the shared token matches; a missing
 * or wrong token is acknowledged but ignored, never applied.
 */

// Reachability / verification check.
export async function GET() {
  return NextResponse.json({ ok: true, service: "shiprocket-webhook" });
}

export async function POST(request: Request) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN ?? "";
  const provided =
    request.headers.get("x-api-key") || request.headers.get("X-Api-Key") || "";

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  // Acknowledge (200) but do nothing unless the token matches and we can write.
  if (!expected || provided !== expected || !isSupabaseAdminConfigured) {
    return NextResponse.json({ ok: true, applied: false });
  }

  const awb = body.awb != null ? String(body.awb) : "";
  const currentStatus =
    (body.current_status as string) ||
    (body.shipment_status as string) ||
    (body.current_status_body as string) ||
    "";
  const courier =
    (body.courier_name as string) || (body.courier as string) || null;

  if (!awb) {
    return NextResponse.json({ ok: true, applied: false, reason: "no awb" });
  }

  // Find the order whose per-vendor refs contain this AWB.
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, tracking_awb")
    .contains("shiprocket_refs", [{ awb_code: awb }])
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ ok: true, applied: false, reason: "no match" });
  }

  const shipping_status = mapShiprocketStatus(currentStatus);
  const update: Record<string, unknown> = {
    shipping_status,
    shipping_updated_at: new Date().toISOString(),
  };
  if (!order.tracking_awb || order.tracking_awb === awb) {
    update.tracking_awb = awb;
    update.tracking_url = trackingUrl(awb);
    if (courier) update.tracking_courier = courier;
  }

  await supabaseAdmin.from("orders").update(update).eq("id", order.id);

  return NextResponse.json({ ok: true, applied: true, status: shipping_status });
}
