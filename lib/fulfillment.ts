import { supabaseAdmin } from "./supabaseAdmin";
import {
  isShiprocketConfigured,
  createAdhocOrder,
  assignAwb,
  requestPickup,
  trackingUrl,
  type AdhocOrderItem,
} from "./shiprocket";

interface ShipmentRef {
  vendor_id: string;
  pickup: string;
  shiprocket_order_id?: number;
  shipment_id?: number;
  awb_code?: string | null;
  courier_name?: string | null;
  tracking_url?: string | null;
  status: "created" | "skipped" | "error";
  message?: string;
}

/**
 * Best-effort: creates one Shiprocket order per vendor for a placed order and
 * records the refs on `orders.shiprocket_refs`. Never throws — shipping issues
 * must not break checkout. No-ops when Shiprocket isn't configured.
 */
export async function createShipmentsForOrder(orderId: string): Promise<void> {
  if (!isShiprocketConfigured) return;

  try {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, payment_mode, customer_name, customer_phone, customer_email, ship_address, ship_city, ship_state, ship_pincode"
      )
      .eq("id", orderId)
      .maybeSingle();
    if (!order || !order.ship_address || !order.ship_pincode) return;

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_id, vendor_id, price")
      .eq("order_id", orderId);
    if (!items || items.length === 0) return;

    const productIds = Array.from(new Set(items.map((i) => i.product_id)));
    const vendorIds = Array.from(new Set(items.map((i) => i.vendor_id)));
    const [{ data: products }, { data: vendors }] = await Promise.all([
      supabaseAdmin.from("products").select("id, title, weight_gms").in("id", productIds),
      supabaseAdmin
        .from("vendors")
        .select("id, shiprocket_pickup_nickname, shiprocket_pickup_registered")
        .in("id", vendorIds),
    ]);
    const productById = new Map((products ?? []).map((p) => [p.id, p]));
    const vendorById = new Map((vendors ?? []).map((v) => [v.id, v]));

    // Group line items by vendor.
    const byVendor = new Map<string, typeof items>();
    for (const it of items) {
      const arr = byVendor.get(it.vendor_id) ?? [];
      arr.push(it);
      byVendor.set(it.vendor_id, arr);
    }

    const paymentMethod = order.payment_mode === "COD" ? "COD" : "Prepaid";
    const refs: ShipmentRef[] = [];

    for (const [vendorId, lines] of byVendor) {
      const vendor = vendorById.get(vendorId);
      const pickup = vendor?.shiprocket_pickup_nickname;
      if (!vendor?.shiprocket_pickup_registered || !pickup) {
        refs.push({
          vendor_id: vendorId,
          pickup: pickup ?? "",
          status: "skipped",
          message: "Vendor has no registered Shiprocket pickup location.",
        });
        continue;
      }

      const srItems: AdhocOrderItem[] = lines.map((l) => ({
        name: productById.get(l.product_id)?.title ?? "Product",
        sku: String(l.product_id).slice(0, 12),
        units: 1,
        selling_price: Number(l.price) || 0,
      }));
      const subTotal = lines.reduce((s, l) => s + (Number(l.price) || 0), 0);
      const weightKg =
        lines.reduce(
          (s, l) => s + (Number(productById.get(l.product_id)?.weight_gms) || 250),
          0
        ) / 1000;

      try {
        const res = await createAdhocOrder({
          order_id: `${orderId.slice(0, 8)}-${vendorId.slice(0, 6)}`,
          pickup_location: pickup,
          customer_name: order.customer_name || "Customer",
          customer_phone: order.customer_phone || "",
          customer_email: order.customer_email || undefined,
          address: order.ship_address,
          city: order.ship_city || "",
          state: order.ship_state || "",
          pincode: order.ship_pincode,
          payment_method: paymentMethod,
          sub_total: subTotal,
          weight_kg: weightKg,
          items: srItems,
        });

        // Auto-book: assign a courier + AWB (charges the Shiprocket wallet),
        // then request a pickup. Best-effort — a booking failure is recorded
        // but never throws.
        let awb = res.awb_code ?? null;
        let courier: string | null = null;
        if (res.shipment_id) {
          try {
            const assigned = await assignAwb(res.shipment_id);
            awb = assigned.awb_code ?? awb;
            courier = assigned.courier_name ?? null;
            if (awb) {
              await requestPickup(res.shipment_id).catch(() => {});
            }
          } catch {
            // AWB assignment failed (no serviceable courier / low balance) —
            // the order still exists in Shiprocket; admin can retry there.
          }
        }

        refs.push({
          vendor_id: vendorId,
          pickup,
          shiprocket_order_id: res.order_id,
          shipment_id: res.shipment_id,
          awb_code: awb,
          courier_name: courier,
          tracking_url: trackingUrl(awb),
          status: "created",
        });
      } catch (e) {
        refs.push({
          vendor_id: vendorId,
          pickup,
          status: "error",
          message: e instanceof Error ? e.message : "Shiprocket error",
        });
      }
    }

    const anyBooked = refs.some((r) => r.status === "created" && r.awb_code);
    const anyCreated = refs.some((r) => r.status === "created");
    // Order-level tracking mirrors the first booked shipment (full detail per
    // vendor stays in shiprocket_refs).
    const primary = refs.find((r) => r.status === "created" && r.awb_code);

    await supabaseAdmin
      .from("orders")
      .update({
        shiprocket_refs: refs,
        shipping_status: anyBooked ? "BOOKED" : anyCreated ? "PENDING" : "PENDING",
        tracking_awb: primary?.awb_code ?? null,
        tracking_courier: primary?.courier_name ?? null,
        tracking_url: primary?.tracking_url ?? null,
        shipping_updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  } catch {
    // Swallow — never break the order flow on a shipping hiccup.
  }
}
