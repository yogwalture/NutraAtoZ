import { NextResponse } from "next/server";
import {
  razorpay,
  isRazorpayConfigured,
  RAZORPAY_KEY_ID,
} from "@/lib/razorpay";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildSplitForCart,
  SplitError,
  type CartLine,
} from "@/lib/routeSplit";

// Razorpay SDK needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

interface CheckoutBody {
  customer_id?: string;
  cart?: CartLine[];
  marketing_source?: "SOCIAL" | "OFFLINE_QR";
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured || !isSupabaseAdminConfigured) {
    return NextResponse.json(
      {
        error:
          "Server not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
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

  const { customer_id, cart, marketing_source } = body;
  if (!customer_id) {
    return NextResponse.json(
      { error: "customer_id is required." },
      { status: 400 }
    );
  }

  try {
    // 1) Read commission % per product and build the dynamic split.
    const split = await buildSplitForCart(cart ?? []);

    // 2) Create a Razorpay Route order with transfers attached — the money
    //    splits automatically when the payment is captured.
    const receipt = `nutz_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: split.amountPaise,
      currency: "INR",
      receipt,
      transfers: split.transfers,
      notes: {
        customer_id,
        platform: "nutraatoz",
        commission_paise: String(split.totalCommissionPaise),
      },
    } as Parameters<typeof razorpay.orders.create>[0] & {
      transfers: typeof split.transfers;
    });

    // 3) Persist a pending order + per-vendor order_items for our own ledger.
    const { data: orderRow, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id,
        total_amount: split.amountPaise / 100,
        payment_mode: "PREPAID",
        marketing_source: marketing_source ?? "SOCIAL",
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

    const itemRows = split.lines.map((l) => ({
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

    // 4) Return what the Razorpay Checkout widget needs on the client.
    return NextResponse.json({
      key_id: RAZORPAY_KEY_ID,
      razorpay_order_id: order.id,
      order_id: orderRow.id,
      amount: split.amountPaise,
      currency: "INR",
      commission_paise: split.totalCommissionPaise,
      transfers: split.transfers,
    });
  } catch (err) {
    if (err instanceof SplitError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message =
      err instanceof Error ? err.message : "Unexpected checkout error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
