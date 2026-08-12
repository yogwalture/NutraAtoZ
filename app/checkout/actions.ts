"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export interface CheckoutLine {
  id: string; // product id
  qty: number;
}

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  total?: number;
  error?: string;
}

const DEFAULT_COMMISSION_PCT = Number(process.env.DEFAULT_COMMISSION_PCT ?? "15");

/**
 * Places a Cash-on-Delivery order: validates the cart against live products,
 * computes commission / vendor payout per line, and writes an order plus
 * order_items to Supabase. Works without Razorpay — prepaid checkout can be
 * added on top once payment keys are configured.
 */
export async function placeCodOrder(
  customer: CheckoutCustomer,
  cart: CheckoutLine[]
): Promise<PlaceOrderResult> {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, error: "Store backend is not configured yet." };
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  for (const field of ["name", "phone", "address", "city", "state", "pincode"] as const) {
    if (!customer[field] || String(customer[field]).trim().length < 2) {
      return { ok: false, error: `Please provide a valid ${field}.` };
    }
  }
  if (!/^[6-9][0-9]{9}$/.test(customer.phone.trim())) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }

  const ids = Array.from(new Set(cart.map((l) => String(l.id))));
  const { data: products, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("id, vendor_id, title, price, commission_pct, is_active")
    .in("id", ids);

  if (prodErr) return { ok: false, error: prodErr.message };
  if (!products || products.length === 0) {
    return { ok: false, error: "Products in your cart are no longer available." };
  }

  const byId = new Map(products.map((p) => [p.id, p]));

  let total = 0;
  const itemRows: {
    product_id: string;
    vendor_id: string;
    price: number;
    commission_amount: number;
    vendor_payout_amount: number;
  }[] = [];

  for (const line of cart) {
    const product = byId.get(String(line.id));
    if (!product || product.is_active === false) continue;
    const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
    const lineTotal = Number(product.price) * qty;
    const pct =
      product.commission_pct != null
        ? Number(product.commission_pct)
        : DEFAULT_COMMISSION_PCT;
    const commission = Math.round(lineTotal * pct) / 100;
    const payout = Math.round((lineTotal - commission) * 100) / 100;
    total += lineTotal;
    itemRows.push({
      product_id: product.id,
      vendor_id: product.vendor_id,
      price: lineTotal,
      commission_amount: commission,
      vendor_payout_amount: payout,
    });
  }

  if (itemRows.length === 0) {
    return { ok: false, error: "No valid items to order." };
  }

  const { data: orderRow, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: null,
      total_amount: total,
      payment_mode: "COD",
      marketing_source: "SOCIAL",
      status: "CONFIRMED",
    })
    .select("id")
    .single();

  if (orderErr) return { ok: false, error: orderErr.message };

  const { error: itemsErr } = await supabaseAdmin
    .from("order_items")
    .insert(itemRows.map((r) => ({ ...r, order_id: orderRow.id })));

  if (itemsErr) return { ok: false, error: itemsErr.message };

  revalidatePath("/vendor/dashboard");
  revalidatePath("/admin");
  return { ok: true, orderId: orderRow.id, total };
}
