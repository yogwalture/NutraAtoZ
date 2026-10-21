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
 * On each status change Shiprocket POSTs the shipment's AWB + current status;
 * we match the AWB to an order (stored in orders.shiprocket_refs) and update
 * its shipping_status + tracking so the admin Shipping page stays live.
 */
export async function POST(request: Request) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN ?? "";
  if (!expected) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 }
    );
  }
  const provided =
    request.headers.get("x-api-key") ||
    request.headers.get("X-Api-Key") ||
    "";
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
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
    // Nothing we can match on — acknowledge so Shiprocket doesn't retry.
    return NextResponse.json({ ok: true, matched: false });
  }

  // Find the order whose per-vendor refs contain this AWB.
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, tracking_awb")
    .contains("shiprocket_refs", [{ awb_code: awb }])
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ ok: true, matched: false });
  }

  const shipping_status = mapShiprocketStatus(currentStatus);
  const update: Record<string, unknown> = {
    shipping_status,
    shipping_updated_at: new Date().toISOString(),
  };
  // Keep order-level tracking current when the event is for the primary AWB.
  if (!order.tracking_awb || order.tracking_awb === awb) {
    update.tracking_awb = awb;
    update.tracking_url = trackingUrl(awb);
    if (courier) update.tracking_courier = courier;
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update(update)
    .eq("id", order.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, matched: true, status: shipping_status });
}
