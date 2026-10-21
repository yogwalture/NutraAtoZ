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

async function apiGet<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ShiprocketError(
      (data.message as string) || "Shiprocket request failed.",
      res.status
    );
  }
  return data as unknown as T;
}

/** Public Shiprocket tracking page for a given AWB. */
export function trackingUrl(awb: string | null | undefined): string | null {
  return awb ? `https://shiprocket.co/tracking/${awb}` : null;
}

/**
 * Normalises a Shiprocket status string to our fulfillment stages.
 * PENDING | BOOKED | SHIPPED | DELIVERED | CANCELLED | RTO
 */
export function mapShiprocketStatus(raw: string | null | undefined): string {
  const s = String(raw ?? "").toUpperCase();
  if (!s) return "BOOKED";
  if (s.includes("DELIVER") && s.includes("RTO")) return "RTO";
  if (s.includes("DELIVER")) return "DELIVERED";
  if (s.includes("RTO")) return "RTO";
  if (s.includes("CANCEL")) return "CANCELLED";
  if (s.includes("LOST") || s.includes("DAMAGED")) return "CANCELLED";
  if (
    s.includes("TRANSIT") ||
    s.includes("OUT FOR DELIVERY") ||
    s.includes("PICKED UP") ||
    s.includes("SHIPPED") ||
    s.includes("DISPATCH")
  )
    return "SHIPPED";
  // NEW, INVOICED, READY TO SHIP, PICKUP SCHEDULED/QUEUED, AWB ASSIGNED …
  return "BOOKED";
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

export interface AwbResult {
  awb_code: string | null;
  courier_name: string | null;
}

/**
 * Assigns the cheapest available courier + AWB to a shipment. This BOOKS the
 * shipment and charges the Shiprocket wallet. Returns the AWB and courier.
 */
export async function assignAwb(shipmentId: number): Promise<AwbResult> {
  const data = await api<Record<string, unknown>>("/courier/assign/awb", {
    shipment_id: shipmentId,
  });
  // Response shape: { response: { data: { awb_code, courier_name, ... } } }
  const resp = (data.response as Record<string, unknown>) ?? {};
  const d = (resp.data as Record<string, unknown>) ?? {};
  const awb = (d.awb_code as string) || (data.awb_code as string) || null;
  const courier =
    (d.courier_name as string) || (data.courier_name as string) || null;
  return { awb_code: awb, courier_name: courier };
}

/** Requests a pickup for a booked shipment (best-effort). */
export async function requestPickup(shipmentId: number): Promise<void> {
  await api("/courier/generate/pickup", { shipment_id: [shipmentId] });
}

export interface TrackResult {
  current_status: string | null;
  awb_code: string | null;
  courier_name: string | null;
}

/** Fetches the latest tracking state for a shipment. */
export async function trackByShipment(shipmentId: number): Promise<TrackResult> {
  const data = await apiGet<Record<string, unknown>>(
    `/courier/track/shipment/${shipmentId}`
  );
  // Response: { tracking_data: { shipment_track: [ { current_status, awb_code, courier_name } ], shipment_status } }
  const td = (data.tracking_data as Record<string, unknown>) ?? {};
  const track = Array.isArray(td.shipment_track)
    ? (td.shipment_track[0] as Record<string, unknown>)
    : {};
  return {
    current_status:
      (track.current_status as string) ||
      (td.shipment_status as string) ||
      null,
    awb_code: (track.awb_code as string) || null,
    courier_name: (track.courier_name as string) || null,
  };
}
