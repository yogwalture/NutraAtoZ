import { supabaseAdmin } from "./supabaseAdmin";
import { RAZORPAY_ADMIN_ACCOUNT_ID } from "./razorpay";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export interface CartLine {
  product_id: string;
  quantity: number;
}

/** A single Razorpay Route transfer (as accepted by Orders/Payments API). */
export interface RouteTransfer {
  account: string; // linked account id, e.g. acc_XXXXXXXXXXXX
  amount: number; // in paise
  currency: "INR";
  notes?: Record<string, string>;
  on_hold?: boolean;
}

/** Per–order-item accounting, persisted into `order_items`. */
export interface LineBreakdown {
  product_id: string;
  vendor_id: string;
  vendor_linked_id: string;
  quantity: number;
  commission_pct: number;
  line_total_paise: number;
  commission_paise: number;
  vendor_payout_paise: number;
}

export interface SplitResult {
  amountPaise: number;
  totalCommissionPaise: number;
  transfers: RouteTransfer[];
  lines: LineBreakdown[];
}

export class SplitError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "SplitError";
  }
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const DEFAULT_COMMISSION_PCT = Number(
  process.env.DEFAULT_COMMISSION_PCT ?? "15"
);

/** Convert a rupee amount (may be a decimal) to integer paise. */
function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/* ------------------------------------------------------------------ *
 * Core: build the dynamic Route transfers payload for a cart.
 * ------------------------------------------------------------------ */

/**
 * Reads each product's `commission_pct` and the vendor's `razorpay_linked_id`,
 * then computes the split:
 *   - commission    = line_total * commission_pct%  → admin account
 *   - vendor_payout = line_total - commission        → vendor's linked account
 *
 * Transfers are aggregated per linked account so an order spanning multiple
 * vendors produces one transfer per vendor (plus one for the admin commission).
 */
export async function buildSplitForCart(
  cart: CartLine[]
): Promise<SplitResult> {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new SplitError("Cart is empty.");
  }

  const normalised = cart.map((l) => {
    const quantity = Math.floor(Number(l.quantity));
    if (!l.product_id || !Number.isFinite(quantity) || quantity < 1) {
      throw new SplitError(`Invalid cart line for product ${l.product_id}.`);
    }
    return { product_id: String(l.product_id), quantity };
  });

  const productIds = Array.from(
    new Set(normalised.map((l) => l.product_id))
  );

  // 1) Fetch the products being purchased.
  const { data: products, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("id, vendor_id, title, price, commission_pct, stock")
    .in("id", productIds);

  if (prodErr) {
    throw new SplitError(`Failed to read products: ${prodErr.message}`, 500);
  }
  if (!products || products.length !== productIds.length) {
    throw new SplitError("One or more products could not be found.", 404);
  }

  // 2) Fetch the vendors that own those products.
  const vendorIds = Array.from(new Set(products.map((p) => p.vendor_id)));
  const { data: vendors, error: vendErr } = await supabaseAdmin
    .from("vendors")
    .select("id, company_name, razorpay_linked_id, is_approved")
    .in("id", vendorIds);

  if (vendErr) {
    throw new SplitError(`Failed to read vendors: ${vendErr.message}`, 500);
  }

  const vendorById = new Map((vendors ?? []).map((v) => [v.id, v]));
  const productById = new Map(products.map((p) => [p.id, p]));

  // 3) Compute per-line accounting.
  const lines: LineBreakdown[] = [];
  const payoutByAccount = new Map<string, number>();
  let amountPaise = 0;
  let totalCommissionPaise = 0;

  for (const { product_id, quantity } of normalised) {
    const product = productById.get(product_id)!;
    const vendor = vendorById.get(product.vendor_id);

    if (!vendor) {
      throw new SplitError(
        `Vendor for product "${product.title}" not found.`,
        404
      );
    }
    if (!vendor.is_approved) {
      throw new SplitError(
        `Vendor "${vendor.company_name}" is not approved to sell yet.`,
        409
      );
    }
    if (!vendor.razorpay_linked_id) {
      throw new SplitError(
        `Vendor "${vendor.company_name}" has no Razorpay linked account.`,
        409
      );
    }
    if (product.stock != null && product.stock < quantity) {
      throw new SplitError(`"${product.title}" has insufficient stock.`, 409);
    }

    const pct =
      product.commission_pct != null
        ? Number(product.commission_pct)
        : DEFAULT_COMMISSION_PCT;

    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw new SplitError(
        `Invalid commission percentage on product "${product.title}".`,
        500
      );
    }

    const lineTotalPaise = toPaise(Number(product.price)) * quantity;
    const commissionPaise = Math.round((lineTotalPaise * pct) / 100);
    const vendorPayoutPaise = lineTotalPaise - commissionPaise;

    amountPaise += lineTotalPaise;
    totalCommissionPaise += commissionPaise;

    payoutByAccount.set(
      vendor.razorpay_linked_id,
      (payoutByAccount.get(vendor.razorpay_linked_id) ?? 0) + vendorPayoutPaise
    );

    lines.push({
      product_id,
      vendor_id: vendor.id,
      vendor_linked_id: vendor.razorpay_linked_id,
      quantity,
      commission_pct: pct,
      line_total_paise: lineTotalPaise,
      commission_paise: commissionPaise,
      vendor_payout_paise: vendorPayoutPaise,
    });
  }

  // 4) Assemble the dynamic Route transfers payload.
  const transfers: RouteTransfer[] = [];

  // 4a) Commission → admin linked account (explicit ledger entry).
  if (RAZORPAY_ADMIN_ACCOUNT_ID && totalCommissionPaise > 0) {
    transfers.push({
      account: RAZORPAY_ADMIN_ACCOUNT_ID,
      amount: totalCommissionPaise,
      currency: "INR",
      notes: { kind: "platform_commission" },
    });
  }

  // 4b) Remaining settlement → each vendor's linked account.
  payoutByAccount.forEach((amount, account) => {
    transfers.push({
      account,
      amount,
      currency: "INR",
      notes: { kind: "vendor_settlement" },
    });
  });

  // Safety: transfers must never exceed the captured amount.
  const transferredTotal = transfers.reduce((s, t) => s + t.amount, 0);
  if (transferredTotal > amountPaise) {
    throw new SplitError(
      "Transfer total exceeds order amount — aborting split.",
      500
    );
  }

  return { amountPaise, totalCommissionPaise, transfers, lines };
}
