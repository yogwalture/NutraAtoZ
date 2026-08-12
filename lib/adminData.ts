import { createSupabaseServerClient } from "./supabaseServerClient";
import { supabaseAdmin } from "./supabaseAdmin";

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
  fssai_license_no: string | null;
  fssai_license_type: string | null;
  fssai_expiry: string | null;
  fssai_certificate_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
  bank_name: string | null;
  bank_ifsc: string | null;
  is_approved: boolean | null;
  created_at: string | null;
}

export async function getAllVendors(): Promise<AdminVendor[]> {
  const { data } = await supabaseAdmin
    .from("vendors")
    .select(
      "id, company_name, store_name, business_type, vendor_role, gstin, fssai_license_no, fssai_license_type, fssai_expiry, fssai_certificate_url, contact_email, contact_phone, city, state, bank_name, bank_ifsc, is_approved, created_at"
    )
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });
  return (data as AdminVendor[]) ?? [];
}

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  commission_pct: number | null;
  stock: number | null;
  is_active: boolean | null;
  vendor_id: string;
  vendor_name: string;
}

export async function getAllProducts(): Promise<AdminProduct[]> {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, title, price, commission_pct, stock, is_active, vendor_id, created_at")
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
    is_active: p.is_active,
    vendor_id: p.vendor_id,
    vendor_name: nameById.get(p.vendor_id) ?? "Vendor",
  }));
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
