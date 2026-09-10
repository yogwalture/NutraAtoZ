/**
 * Server-side Shiprocket client (India courier aggregator).
 *
 * Auth: Shiprocket issues a bearer token from an API user's email+password
 * (Settings → API → Create an API User). Tokens are valid ~10 days; we cache
 * in-process and refresh on demand.
 *
 * Env: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD. When unset, `isShiprocketConfigured`
 * is false and callers no-op so the store keeps working without shipping.
 *
 * Server-only — never import into a client component.
 */

const BASE = "https://apiv2.shiprocket.in/v1/external";

const email = process.env.SHIPROCKET_EMAIL ?? "";
const password = process.env.SHIPROCKET_PASSWORD ?? "";

export const isShiprocketConfigured = Boolean(email && password);

let cachedToken: { token: string; expires: number } | null = null;

export class ShiprocketError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
    this.name = "ShiprocketError";
  }
}

async function getToken(): Promise<string> {
  if (!isShiprocketConfigured) {
    throw new ShiprocketError("Shiprocket is not configured.", 503);
  }
  if (cachedToken && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    message?: string;
  };
  if (!res.ok || !data.token) {
    throw new ShiprocketError(
      data.message || "Shiprocket authentication failed.",
      res.status === 400 || res.status === 401 ? 401 : 502
    );
  }
  // Cache for 9 days (tokens last ~10).
  cachedToken = { token: data.token, expires: Date.now() + 9 * 24 * 3600 * 1000 };
  return data.token;
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (data.message as string) ||
      (typeof data.errors === "object" ? JSON.stringify(data.errors) : "") ||
      "Shiprocket request failed.";
    throw new ShiprocketError(msg, res.status);
  }
  return data as unknown as T;
}

export interface PickupAddress {
  nickname: string; // unique per Shiprocket account
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

/** Register (or re-register) a vendor pickup location. Returns the nickname. */
export async function createPickupLocation(a: PickupAddress): Promise<string> {
  await api("/settings/company/addpickup", {
    pickup_location: a.nickname,
    name: a.name,
    email: a.email,
    phone: a.phone,
    address: a.address,
    address_2: "",
    city: a.city,
    state: a.state,
    country: "India",
    pin_code: a.pincode,
  });
  return a.nickname;
}

export interface AdhocOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number; // rupees
}

export interface AdhocOrderInput {
  order_id: string; // our reference
  pickup_location: string; // vendor nickname
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: "Prepaid" | "COD";
  sub_total: number; // rupees
  weight_kg: number;
  items: AdhocOrderItem[];
}

export interface AdhocOrderResult {
  order_id?: number;
  shipment_id?: number;
  status?: string;
  awb_code?: string | null;
}

/** Create a Shiprocket order (one per vendor shipment). */
export async function createAdhocOrder(
  input: AdhocOrderInput
): Promise<AdhocOrderResult> {
  const [firstName, ...rest] = input.customer_name.trim().split(" ");
  const lastName = rest.join(" ") || ".";
  return api<AdhocOrderResult>("/orders/create/adhoc", {
    order_id: input.order_id,
    order_date: new Date().toISOString().slice(0, 10),
    pickup_location: input.pickup_location,
    billing_customer_name: firstName || input.customer_name,
    billing_last_name: lastName,
    billing_address: input.address,
    billing_city: input.city,
    billing_pincode: input.pincode,
    billing_state: input.state,
    billing_country: "India",
    billing_email: input.customer_email || "",
    billing_phone: input.customer_phone,
    shipping_is_billing: true,
    order_items: input.items,
    payment_method: input.payment_method,
    sub_total: input.sub_total,
    length: 15,
    breadth: 12,
    height: 8,
    weight: Math.max(0.1, input.weight_kg),
  });
}
