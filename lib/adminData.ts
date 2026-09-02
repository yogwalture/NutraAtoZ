import { createSupabaseServerClient } from "./supabaseServerClient";
import { supabaseAdmin } from "./supabaseAdmin";
import {
  parseAttributes,
  type DiscountType,
  type ProductAttribute,
} from "./pricing";

export interface AdminContext {
  email: string | null;
  isAdmin: boolean;
}

/** Resolve the logged-in user and whether they hold the admin role. */
export async function getAdminContext(): Promise<AdminContext> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { email: null, isAdmin: false };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { email: user.email ?? null, isAdmin: profile?.role === "admin" };
}

/* ------------------------------------------------------------------ *
 * Platform-wide data (service role — admin only)
 * ------------------------------------------------------------------ */

export interface PlatformStats {
  gmv: number;
  commission: number;
  orders: number;
  vendors: number;
  pendingVendors: number;
  products: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [{ data: items }, { data: vendors }, { data: products }] =
    await Promise.all([
      supabaseAdmin
        .from("order_items")
        .select("order_id, price, commission_amount"),
      supabaseAdmin.from("vendors").select("id, is_approved"),
      supabaseAdmin.from("products").select("id"),
    ]);

  const gmv = (items ?? []).reduce((s, i) => s + (Number(i.price) || 0), 0);
  const commission = (items ?? []).reduce(
    (s, i) => s + (Number(i.commission_amount) || 0),
    0
  );
  const orders = new Set((items ?? []).map((i) => i.order_id)).size;
  const vendorCount = (vendors ?? []).length;
  const pendingVendors = (vendors ?? []).filter((v) => !v.is_approved).length;

  return {
    gmv,
    commission,
    orders,
    vendors: vendorCount,
    pendingVendors,
    products: (products ?? []).length,
  };
}

export interface AdminVendor {
  id: string;
  company_name: string | null;
  store_name: string | null;
  business_type: string | null;
  vendor_role: string | null;
  gstin: string | null;
  pan: string | null;
  fssai_license_no: string | null;
  fssai_license_type: string | null;
  fssai_expiry: string | null;
  fssai_certificate_url: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  bank_name: string | null;
  bank_ifsc: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  commission_pct: number | null;
  is_approved: boolean | null;
  created_at: string | null;
}

export async function getAllVendors(): Promise<AdminVendor[]> {
  const { data } = await supabaseAdmin
    .from("vendors")
    .select(
      "id, company_name, store_name, business_type, vendor_role, gstin, pan, fssai_license_no, fssai_license_type, fssai_expiry, fssai_certificate_url, contact_person, contact_email, contact_phone, address_line, city, state, pincode, bank_name, bank_ifsc, bank_account_number, bank_account_holder, commission_pct, is_approved, created_at"
    )
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });
  return (data as AdminVendor[]) ?? [];
}

/* ------------------------------------------------------------------ *
 * Commission portal
 * ------------------------------------------------------------------ */

export async function getPlatformCommission(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("platform_settings")
    .select("default_commission_pct")
    .eq("id", 1)
    .maybeSingle();
  return Number(data?.default_commission_pct ?? 15);
}

export interface VendorCommissionRow {
  id: string;
  name: string;
  commission_pct: number | null;
  gmv: number;
  commission: number;
  payout: number;
  orders: number;
  products: number;
}

export interface CommissionData {
  defaultCommission: number;
  totalGmv: number;
  totalCommission: number;
  totalPayout: number;
  vendors: VendorCommissionRow[];
}

export async function getCommissionData(): Promise<CommissionData> {
  const [defaultCommission, { data: vendors }, { data: items }, { data: products }] =
    await Promise.all([
      getPlatformCommission(),
      supabaseAdmin
        .from("vendors")
        .select("id, store_name, company_name, commission_pct"),
      supabaseAdmin
        .from("order_items")
        .select("order_id, vendor_id, price, commission_amount, vendor_payout_amount"),
      supabaseAdmin.from("products").select("id, vendor_id"),
    ]);

  const byVendor = new Map<string, VendorCommissionRow>();
  (vendors ?? []).forEach((v) => {
    byVendor.set(v.id, {
      id: v.id,
      name: v.store_name || v.company_name || "Vendor",
      commission_pct: v.commission_pct,
      gmv: 0,
      commission: 0,
      payout: 0,
      orders: 0,
      products: 0,
    });
  });

  const orderSets = new Map<string, Set<string>>();
  (items ?? []).forEach((i) => {
    const row = byVendor.get(i.vendor_id);
    if (!row) return;
    row.gmv += Number(i.price) || 0;
    row.commission += Number(i.commission_amount) || 0;
    row.payout += Number(i.vendor_payout_amount) || 0;
    if (!orderSets.has(i.vendor_id)) orderSets.set(i.vendor_id, new Set());
    orderSets.get(i.vendor_id)!.add(i.order_id);
  });
  orderSets.forEach((set, vid) => {
    const row = byVendor.get(vid);
    if (row) row.orders = set.size;
  });

  (products ?? []).forEach((p) => {
    const row = byVendor.get(p.vendor_id);
    if (row) row.products += 1;
  });

  const rows = Array.from(byVendor.values()).sort((a, b) => b.gmv - a.gmv);
  return {
    defaultCommission,
    totalGmv: rows.reduce((s, r) => s + r.gmv, 0),
    totalCommission: rows.reduce((s, r) => s + r.commission, 0),
    totalPayout: rows.reduce((s, r) => s + r.payout, 0),
    vendors: rows,
  };
}

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  commission_pct: number | null;
  stock: number | null;
  weight_gms: number | null;
  description: string | null;
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
  vendor_id: string;
  vendor_name: string;
}

export async function getAllProducts(): Promise<AdminProduct[]> {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select(
      "id, title, price, commission_pct, stock, weight_gms, description, ingredients, lab_tested_url, coa_status, coa_lab, coa_batch, coa_date, discount_type, discount_value, attributes, goals, is_active, vendor_id, created_at"
    )
    .order("created_at", { ascending: false });

  if (!products || products.length === 0) return [];

  const vendorIds = Array.from(new Set(products.map((p) => p.vendor_id)));
  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select("id, store_name, company_name")
    .in("id", vendorIds);
  const nameById = new Map(
    (vendors ?? []).map((v) => [v.id, v.store_name || v.company_name || "Vendor"])
  );

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price) || 0,
    commission_pct: p.commission_pct,
    stock: p.stock,
    weight_gms: p.weight_gms,
    description: p.description,
    ingredients: p.ingredients,
    lab_tested_url: p.lab_tested_url,
    coa_status: p.coa_status ?? null,
    coa_lab: p.coa_lab ?? null,
    coa_batch: p.coa_batch ?? null,
    coa_date: p.coa_date ?? null,
    discount_type:
      p.discount_type === "PCT" || p.discount_type === "FLAT"
        ? p.discount_type
        : null,
    discount_value: p.discount_value,
    attributes: parseAttributes(p.attributes),
    goals: Array.isArray(p.goals) ? (p.goals as string[]) : [],
    is_active: p.is_active,
    vendor_id: p.vendor_id,
    vendor_name: nameById.get(p.vendor_id) ?? "Vendor",
  }));
}

/* ------------------------------------------------------------------ *
 * Vendor acquisition CRM (leads)
 * ------------------------------------------------------------------ */

export type LeadStage = "LEAD" | "CONTACTED" | "ONBOARDING" | "LIVE" | "LOST";

export interface VendorLead {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  stage: LeadStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAllLeads(): Promise<VendorLead[]> {
  const { data } = await supabaseAdmin
    .from("vendor_leads")
    .select(
      "id, company_name, contact_name, contact_email, contact_phone, city, state, source, stage, notes, created_at, updated_at"
    )
    .order("updated_at", { ascending: false });
  return (data ?? []) as VendorLead[];
}

/* ------------------------------------------------------------------ *
 * Analytics (first-party funnel)
 * ------------------------------------------------------------------ */

export interface AnalyticsSummary {
  days: number;
  totals: Record<string, number>;
  funnel: { label: string; event: string; count: number }[];
  topProducts: { id: string; title: string; views: number }[];
  purchaseValue: number;
  eventCount: number;
}

export async function getAnalyticsSummary(
  days = 30
): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows } = await supabaseAdmin
    .from("analytics_events")
    .select("event, product_id, meta, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20000);

  const events = rows ?? [];
  const totals: Record<string, number> = {};
  const productViews = new Map<string, number>();
  let purchaseValue = 0;

  for (const e of events) {
    const ev = String(e.event);
    totals[ev] = (totals[ev] ?? 0) + 1;
    if (ev === "product_view" && e.product_id) {
      productViews.set(e.product_id, (productViews.get(e.product_id) ?? 0) + 1);
    }
    if (ev === "purchase" && e.meta && typeof e.meta === "object") {
      const t = Number((e.meta as Record<string, unknown>).total);
      if (Number.isFinite(t)) purchaseValue += t;
    }
  }

  const funnel = [
    { label: "Product views", event: "product_view" },
    { label: "Add to cart", event: "add_to_cart" },
    { label: "Began checkout", event: "begin_checkout" },
    { label: "Purchases", event: "purchase" },
  ].map((s) => ({ ...s, count: totals[s.event] ?? 0 }));

  // Resolve titles for the most-viewed products.
  const topIds = Array.from(productViews.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  let titleById = new Map<string, string>();
  if (topIds.length > 0) {
    const { data: prods } = await supabaseAdmin
      .from("products")
      .select("id, title")
      .in(
        "id",
        topIds.map(([id]) => id)
      );
    titleById = new Map((prods ?? []).map((p) => [p.id, p.title]));
  }
  const topProducts = topIds.map(([id, views]) => ({
    id,
    title: titleById.get(id) ?? "Unknown product",
    views,
  }));

  return {
    days,
    totals,
    funnel,
    topProducts,
    purchaseValue,
    eventCount: events.length,
  };
}

export interface AdminOrderItem {
  id: string;
  order_id: string;
  product_title: string;
  vendor_name: string;
  price: number;
  commission_amount: number;
  vendor_payout_amount: number;
  status: string;
  created_at: string | null;
}

export async function getAllOrderItems(limit = 200): Promise<AdminOrderItem[]> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select(
      "id, order_id, product_id, vendor_id, price, commission_amount, vendor_payout_amount"
    )
    .limit(limit);
  if (!items || items.length === 0) return [];

  const orderIds = Array.from(new Set(items.map((i) => i.order_id)));
  const productIds = Array.from(new Set(items.map((i) => i.product_id)));
  const vendorIds = Array.from(new Set(items.map((i) => i.vendor_id)));

  const [{ data: orders }, { data: products }, { data: vendors }] =
    await Promise.all([
      supabaseAdmin.from("orders").select("id, status, created_at").in("id", orderIds),
      supabaseAdmin.from("products").select("id, title").in("id", productIds),
      supabaseAdmin.from("vendors").select("id, store_name, company_name").in("id", vendorIds),
    ]);

  const orderById = new Map((orders ?? []).map((o) => [o.id, o]));
  const titleById = new Map((products ?? []).map((p) => [p.id, p.title]));
  const vNameById = new Map(
    (vendors ?? []).map((v) => [v.id, v.store_name || v.company_name || "Vendor"])
  );

  const rows: AdminOrderItem[] = items.map((i) => {
    const o = orderById.get(i.order_id);
    return {
      id: i.id,
      order_id: i.order_id,
      product_title: titleById.get(i.product_id) ?? "Product",
      vendor_name: vNameById.get(i.vendor_id) ?? "Vendor",
      price: Number(i.price) || 0,
      commission_amount: Number(i.commission_amount) || 0,
      vendor_payout_amount: Number(i.vendor_payout_amount) || 0,
      status: o?.status ?? "CREATED",
      created_at: o?.created_at ?? null,
    };
  });

  rows.sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });
  return rows;
}
