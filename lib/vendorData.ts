import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";
import { createSupabaseServerClient } from "./supabaseServerClient";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export interface VendorRow {
  id: string;
  company_name: string | null;
  store_name?: string | null;
  contact_email?: string | null;
  gstin: string | null;
  fssai_license_no: string | null;
  fssai_expiry: string | null;
  fssai_certificate_url?: string | null;
  razorpay_linked_id: string | null;
  is_approved: boolean | null;
}

export interface VendorContext {
  configured: boolean;
  /** whether a user is signed in */
  authed: boolean;
  vendor: VendorRow | null;
  vendorId: string | null;
}

import { parseAttributes, type DiscountType, type ProductAttribute } from "./pricing";

export interface ProductRow {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  price: number;
  commission_pct: number | null;
  stock: number | null;
  weight_gms: number | null;
  ingredients: string | null;
  lab_tested_url: string | null;
  coa_status: string | null;
  coa_lab: string | null;
  coa_batch: string | null;
  coa_date: string | null;
  discount_type: DiscountType;
  discount_value: number | null;
  attributes: ProductAttribute[];
  goals: string[];
  is_active: boolean | null;
  created_at?: string | null;
}

export interface OverviewStats {
  revenue: number;
  payouts: number;
  commission: number;
  orderCount: number;
  productCount: number;
  activeProductCount: number;
  series: { label: string; value: number }[];
  recentOrders: VendorOrderItem[];
}

export interface VendorOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  price: number;
  commission_amount: number;
  vendor_payout_amount: number;
  order_status: string;
  order_created_at: string | null;
}

/* ------------------------------------------------------------------ *
 * Vendor resolution — the vendor is the vendors row linked to the
 * signed-in Supabase auth user (vendors.user_id). If the user has an
 * unclaimed application matching their email, it is auto-linked ("claimed")
 * on first sign-in.
 * ------------------------------------------------------------------ */

const VENDOR_SELECT =
  "id, company_name, store_name, contact_email, gstin, fssai_license_no, fssai_expiry, fssai_certificate_url, razorpay_linked_id, is_approved";

export async function getVendorContext(): Promise<VendorContext> {
  if (!isSupabaseAdminConfigured) {
    return { configured: false, authed: false, vendor: null, vendorId: null };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, authed: false, vendor: null, vendorId: null };
  }

  // 1) vendor already linked to this account
  let { data } = await supabaseAdmin
    .from("vendors")
    .select(VENDOR_SELECT)
    .eq("user_id", user.id)
    .maybeSingle();

  // 2) otherwise claim an unclaimed application with the same contact email
  if (!data && user.email) {
    const { data: byEmail } = await supabaseAdmin
      .from("vendors")
      .select(VENDOR_SELECT)
      .ilike("contact_email", user.email)
      .is("user_id", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (byEmail) {
      await supabaseAdmin
        .from("vendors")
        .update({ user_id: user.id })
        .eq("id", byEmail.id);
      data = byEmail;
    }
  }

  return {
    configured: true,
    authed: true,
    vendor: (data as VendorRow) ?? null,
    vendorId: (data as VendorRow)?.id ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * Fetchers (all scoped by vendorId)
 * ------------------------------------------------------------------ */

export async function getVendorProducts(
  vendorId: string
): Promise<ProductRow[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select(
      "id, vendor_id, title, description, price, commission_pct, stock, weight_gms, ingredients, lab_tested_url, coa_status, coa_lab, coa_batch, coa_date, discount_type, discount_value, attributes, goals, is_active, created_at"
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  return ((data as Record<string, unknown>[]) ?? []).map((p) => ({
    ...(p as unknown as ProductRow),
    attributes: parseAttributes(p.attributes),
    goals: Array.isArray(p.goals) ? (p.goals as string[]) : [],
  }));
}

/** Joins order_items to their parent order (status, date) in JS. */
export async function getVendorOrderItems(
  vendorId: string,
  limit = 200
): Promise<VendorOrderItem[]> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select(
      "id, order_id, product_id, price, commission_amount, vendor_payout_amount"
    )
    .eq("vendor_id", vendorId)
    .limit(limit);

  if (!items || items.length === 0) return [];

  const orderIds = Array.from(new Set(items.map((i) => i.order_id)));
  const productIds = Array.from(new Set(items.map((i) => i.product_id)));

  const [{ data: orders }, { data: products }] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id, status, created_at")
      .in("id", orderIds),
    supabaseAdmin.from("products").select("id, title").in("id", productIds),
  ]);

  const orderById = new Map((orders ?? []).map((o) => [o.id, o]));
  const titleById = new Map((products ?? []).map((p) => [p.id, p.title]));

  const rows: VendorOrderItem[] = items.map((i) => {
    const order = orderById.get(i.order_id);
    return {
      id: i.id,
      order_id: i.order_id,
      product_id: i.product_id,
      product_title: titleById.get(i.product_id) ?? "Product",
      price: Number(i.price) || 0,
      commission_amount: Number(i.commission_amount) || 0,
      vendor_payout_amount: Number(i.vendor_payout_amount) || 0,
      order_status: order?.status ?? "CREATED",
      order_created_at: order?.created_at ?? null,
    };
  });

  rows.sort((a, b) => {
    const ta = a.order_created_at ? Date.parse(a.order_created_at) : 0;
    const tb = b.order_created_at ? Date.parse(b.order_created_at) : 0;
    return tb - ta;
  });

  return rows;
}

export async function getOverviewStats(
  vendorId: string
): Promise<OverviewStats> {
  const [items, products] = await Promise.all([
    getVendorOrderItems(vendorId, 500),
    getVendorProducts(vendorId),
  ]);

  const revenue = items.reduce((s, i) => s + i.price, 0);
  const payouts = items.reduce((s, i) => s + i.vendor_payout_amount, 0);
  const commission = items.reduce((s, i) => s + i.commission_amount, 0);
  const orderCount = new Set(items.map((i) => i.order_id)).size;

  const days = 14;
  const buckets: { label: string; value: number }[] = [];
  const now = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    const key = day.toISOString().slice(0, 10);
    const value = items
      .filter((i) => (i.order_created_at ?? "").slice(0, 10) === key)
      .reduce((s, i) => s + i.vendor_payout_amount, 0);
    buckets.push({
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value,
    });
  }

  return {
    revenue,
    payouts,
    commission,
    orderCount,
    productCount: products.length,
    activeProductCount: products.filter((p) => p.is_active !== false).length,
    series: buckets,
    recentOrders: items.slice(0, 6),
  };
}

/* ------------------------------------------------------------------ *
 * Payout statements (monthly settlement summaries)
 * ------------------------------------------------------------------ */

export interface StatementSummary {
  month: string; // YYYY-MM
  label: string; // "September 2026"
  gross: number;
  commission: number;
  payout: number;
  orderCount: number;
  lineCount: number;
}

export interface StatementLine {
  id: string;
  orderId: string;
  date: string | null;
  productTitle: string;
  gross: number;
  commission: number;
  payout: number;
  status: string;
}

export interface VendorStatement {
  summary: StatementSummary;
  lines: StatementLine[];
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

/** Monthly settlement summaries for a vendor, newest month first. */
export async function getVendorStatements(
  vendorId: string
): Promise<StatementSummary[]> {
  const items = await getVendorOrderItems(vendorId, 2000);
  const byMonth = new Map<string, StatementSummary>();
  for (const i of items) {
    const month = (i.order_created_at ?? "").slice(0, 7);
    if (!month) continue;
    const s =
      byMonth.get(month) ??
      ({
        month,
        label: monthLabel(month),
        gross: 0,
        commission: 0,
        payout: 0,
        orderCount: 0,
        lineCount: 0,
      } as StatementSummary);
    s.gross += i.price;
    s.commission += i.commission_amount;
    s.payout += i.vendor_payout_amount;
    s.lineCount += 1;
    byMonth.set(month, s);
  }
  // distinct orders per month
  const ordersByMonth = new Map<string, Set<string>>();
  for (const i of items) {
    const month = (i.order_created_at ?? "").slice(0, 7);
    if (!month) continue;
    const set = ordersByMonth.get(month) ?? new Set<string>();
    set.add(i.order_id);
    ordersByMonth.set(month, set);
  }
  for (const [month, s] of byMonth) s.orderCount = ordersByMonth.get(month)?.size ?? 0;

  return Array.from(byMonth.values()).sort((a, b) => b.month.localeCompare(a.month));
}

/** A single month's statement with line items. null if the month has none. */
export async function getVendorStatement(
  vendorId: string,
  month: string
): Promise<VendorStatement | null> {
  const items = (await getVendorOrderItems(vendorId, 2000)).filter(
    (i) => (i.order_created_at ?? "").slice(0, 7) === month
  );
  if (items.length === 0) return null;

  const lines: StatementLine[] = items.map((i) => ({
    id: i.id,
    orderId: i.order_id,
    date: i.order_created_at,
    productTitle: i.product_title,
    gross: i.price,
    commission: i.commission_amount,
    payout: i.vendor_payout_amount,
    status: i.order_status,
  }));

  const summary: StatementSummary = {
    month,
    label: monthLabel(month),
    gross: lines.reduce((s, l) => s + l.gross, 0),
    commission: lines.reduce((s, l) => s + l.commission, 0),
    payout: lines.reduce((s, l) => s + l.payout, 0),
    orderCount: new Set(lines.map((l) => l.orderId)).size,
    lineCount: lines.length,
  };

  return { summary, lines };
}

/* ------------------------------------------------------------------ *
 * Vendor insights (per-vendor funnel + performance)
 * ------------------------------------------------------------------ */

export interface VendorInsights {
  days: number;
  views: number;
  addToCart: number;
  orderLines: number;
  revenue: number;
  payouts: number;
  commission: number;
  /** Storefront conversion: orderLines / views. */
  conversionPct: number;
  topProducts: { id: string; title: string; views: number; orders: number }[];
  lowStock: { id: string; title: string; stock: number }[];
}

const LOW_STOCK_THRESHOLD = 5;

export async function getVendorInsights(
  vendorId: string,
  days = 30
): Promise<VendorInsights> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const products = await getVendorProducts(vendorId);
  const productIds = products.map((p) => p.id);
  const titleById = new Map(products.map((p) => [p.id, p.title]));

  const empty: VendorInsights = {
    days,
    views: 0,
    addToCart: 0,
    orderLines: 0,
    revenue: 0,
    payouts: 0,
    commission: 0,
    conversionPct: 0,
    topProducts: [],
    lowStock: products
      .filter((p) => p.stock != null && (p.stock as number) <= LOW_STOCK_THRESHOLD)
      .map((p) => ({ id: p.id, title: p.title, stock: p.stock as number }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10),
  };
  if (productIds.length === 0) return empty;

  // Analytics events scoped to this vendor's products.
  const { data: events } = await supabaseAdmin
    .from("analytics_events")
    .select("event, product_id, created_at")
    .in("product_id", productIds)
    .gte("created_at", since)
    .limit(20000);

  const viewsByProduct = new Map<string, number>();
  let views = 0;
  let addToCart = 0;
  for (const e of events ?? []) {
    if (e.event === "product_view") {
      views += 1;
      if (e.product_id)
        viewsByProduct.set(e.product_id, (viewsByProduct.get(e.product_id) ?? 0) + 1);
    } else if (e.event === "add_to_cart") {
      addToCart += 1;
    }
  }

  // Orders for this vendor in the window.
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, price, commission_amount, vendor_payout_amount, order_id, created_at")
    .eq("vendor_id", vendorId)
    .gte("created_at", since)
    .limit(20000);

  let revenue = 0;
  let payouts = 0;
  let commission = 0;
  const ordersByProduct = new Map<string, number>();
  for (const i of items ?? []) {
    revenue += Number(i.price) || 0;
    payouts += Number(i.vendor_payout_amount) || 0;
    commission += Number(i.commission_amount) || 0;
    if (i.product_id)
      ordersByProduct.set(i.product_id, (ordersByProduct.get(i.product_id) ?? 0) + 1);
  }
  const orderLines = (items ?? []).length;

  const topProducts = Array.from(
    new Set([...viewsByProduct.keys(), ...ordersByProduct.keys()])
  )
    .map((id) => ({
      id,
      title: titleById.get(id) ?? "Product",
      views: viewsByProduct.get(id) ?? 0,
      orders: ordersByProduct.get(id) ?? 0,
    }))
    .sort((a, b) => b.views - a.views || b.orders - a.orders)
    .slice(0, 8);

  return {
    ...empty,
    views,
    addToCart,
    orderLines,
    revenue,
    payouts,
    commission,
    conversionPct: views > 0 ? Math.round((orderLines / views) * 1000) / 10 : 0,
    topProducts,
  };
}
