import { NextResponse } from "next/server";
import {
  razorpay,
  isRazorpayConfigured,
  RAZORPAY_KEY_ID,
} from "@/lib/razorpay";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { buildOrderPlan, SplitError, type CartLine } from "@/lib/routeSplit";

// Razorpay SDK needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

interface CheckoutBody {
  cart?: CartLine[];
  marketing_source?: "SOCIAL" | "OFFLINE_QR";
}

/** Flat shipping fee (paise) mirrors the storefront rule: free over ₹999. */
function shippingPaise(subtotalPaise: number): number {
  return subtotalPaise >= 99900 ? 0 : 4900;
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured || !isSupabaseAdminConfigured) {
    return NextResponse.json(
      {
        error:
          "Online payments are not configured yet. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const cart = body.cart ?? [];
  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Resolve the signed-in customer (optional — guests may pay too).
  let customerId: string | null = null;
  try {
    const supa = createSupabaseServerClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    customerId = user?.id ?? null;
  } catch {
    customerId = null;
  }

  try {
    // 1) Server-authoritative amount + per-line ledger (never trust the client).
    const plan = await buildOrderPlan(cart);
    const amountPaise = plan.amountPaise + shippingPaise(plan.amountPaise);

    // Razorpay requires a minimum of 100 paise (₹1).
    if (amountPaise < 100) {
      return NextResponse.json(
        { error: "Order amount is below the ₹1 minimum." },
        { status: 400 }
      );
    }

    // 2) Create the Razorpay order (with Route transfers only if splittable).
    const receipt = `nutz_${Date.now()}`;
    const orderPayload: Record<string, unknown> = {
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        platform: "nutraatoz",
        customer_id: customerId ?? "guest",
        commission_paise: String(plan.totalCommissionPaise),
      },
    };
    if (plan.splittable && plan.transfers.length > 0) {
      orderPayload.transfers = plan.transfers;
    }

    let order: { id: string };
    try {
      order = (await razorpay.orders.create(
        orderPayload as unknown as Parameters<typeof razorpay.orders.create>[0]
      )) as { id: string };
    } catch (rzpErr) {
      const status =
        typeof rzpErr === "object" &&
        rzpErr !== null &&
        "statusCode" in rzpErr &&
        (rzpErr as { statusCode?: number }).statusCode === 401
          ? 401
          : 500;
      const message =
        status === 401
          ? "Razorpay authentication failed — check your API keys."
          : "Could not create the payment order with Razorpay.";
      return NextResponse.json({ error: message }, { status });
    }

    // 3) Persist a pending order + per-vendor ledger rows.
    const { data: orderRow, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerId,
        total_amount: amountPaise / 100,
        payment_mode: "PREPAID",
        marketing_source: body.marketing_source ?? "SOCIAL",
        razorpay_order_id: order.id,
        status: "CREATED",
      })
      .select("id")
      .single();

    if (orderErr) {
      return NextResponse.json(
        { error: `Could not save order: ${orderErr.message}` },
        { status: 500 }
      );
    }

    const itemRows = plan.lines.map((l) => ({
      order_id: orderRow.id,
      product_id: l.product_id,
      vendor_id: l.vendor_id,
      price: l.line_total_paise / 100,
      commission_amount: l.commission_paise / 100,
      vendor_payout_amount: l.vendor_payout_paise / 100,
    }));
    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(itemRows);
    if (itemsErr) {
      return NextResponse.json(
        { error: `Could not save order items: ${itemsErr.message}` },
        { status: 500 }
      );
    }

    // 4) Everything the Razorpay Checkout widget needs on the client.
    return NextResponse.json({
      key_id: RAZORPAY_KEY_ID,
      razorpay_order_id: order.id,
      order_id: orderRow.id,
      amount: amountPaise,
      currency: "INR",
    });
  } catch (err) {
    if (err instanceof SplitError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message =
      err instanceof Error ? err.message : "Unexpected checkout error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
