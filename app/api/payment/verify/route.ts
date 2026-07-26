import { NextResponse } from "next/server";
import crypto from "crypto";
import { RAZORPAY_KEY_SECRET, isRazorpayConfigured } from "@/lib/razorpay";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

/**
 * Confirms a successful Razorpay payment by verifying the HMAC signature,
 * then marks the local order PAID.
 */
export async function POST(request: Request) {
  if (!isRazorpayConfigured || !isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Server not configured." },
      { status: 503 }
    );
  }

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing razorpay_order_id, razorpay_payment_id or signature." },
      { status: 400 }
    );
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(razorpay_signature)
    );

  if (!valid) {
    return NextResponse.json(
      { error: "Payment signature verification failed." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "PAID", razorpay_payment_id })
    .eq("razorpay_order_id", razorpay_order_id);

  if (error) {
    return NextResponse.json(
      { error: `Could not update order: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
