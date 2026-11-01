import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Data revocation ("right to be forgotten"). All customer/vendor data stays
 * stored by default; these helpers let an admin — or the customer themselves —
 * anonymize or delete personal data on request. Financial/ledger rows
 * (order_items, totals) are preserved for accounting but stripped of PII.
 *
 * Every action is recorded in `data_requests` for an auditable trail.
 */

const REDACTED = "[deleted]";

export interface PrivacyResult {
  ok: boolean;
  error?: string;
  affected?: { orders: number };
}

async function findAuthUserByEmail(email: string) {
  const { data } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const lower = email.toLowerCase();
  return data?.users.find((u) => (u.email ?? "").toLowerCase() === lower) ?? null;
}

async function logRequest(row: {
  kind: "ANONYMIZE" | "DELETE";
  subject_type: "customer" | "vendor";
  subject_email?: string | null;
  subject_id?: string | null;
  requested_by: string;
  note?: string;
}) {
  await supabaseAdmin.from("data_requests").insert({
    kind: row.kind,
    subject_type: row.subject_type,
    subject_email: row.subject_email ?? null,
    subject_id: row.subject_id ?? null,
    requested_by: row.requested_by,
    status: "COMPLETED",
    note: row.note ?? null,
  });
}

/** Strips PII from a user's records, keeping anonymized order history. */
async function scrubUser(userId: string | null, email: string | null) {
  // Orders — keep the row (and its financial line items) but remove PII.
  let orders = 0;
  if (email) {
    const { data } = await supabaseAdmin
      .from("orders")
      .update({
        customer_name: REDACTED,
        customer_email: null,
        customer_phone: null,
        ship_address: REDACTED,
        ship_city: null,
        ship_state: null,
        ship_pincode: null,
      })
      .ilike("customer_email", email)
      .select("id");
    orders = data?.length ?? 0;
  }

  if (userId) {
    // Orders linked by customer_id (covers signed-in orders with another email).
    await supabaseAdmin
      .from("orders")
      .update({
        customer_name: REDACTED,
        customer_email: null,
        customer_phone: null,
        ship_address: REDACTED,
        ship_city: null,
        ship_state: null,
        ship_pincode: null,
      })
      .eq("customer_id", userId);

    // Reviews — anonymize the public reviewer name; keep rating/body.
    await supabaseAdmin
      .from("reviews")
      .update({ reviewer_name: REDACTED })
      .eq("customer_id", userId);

    // Wellness scans are health data — delete outright.
    await supabaseAdmin.from("wellness_scans").delete().eq("user_id", userId);
  }

  return orders;
}

/** Admin: anonymize a customer identified by email (keeps anonymized history). */
export async function anonymizeCustomerByEmail(
  email: string,
  requestedBy: string
): Promise<PrivacyResult> {
  const clean = email.trim().toLowerCase();
  if (!clean) return { ok: false, error: "Email is required." };

  const user = await findAuthUserByEmail(clean);
  const orders = await scrubUser(user?.id ?? null, clean);

  if (user?.id) {
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: null, email: null, phone_number: null })
      .eq("id", user.id);
  }

  await logRequest({
    kind: "ANONYMIZE",
    subject_type: "customer",
    subject_email: clean,
    subject_id: user?.id ?? null,
    requested_by: requestedBy,
    note: `Anonymized ${orders} order(s).`,
  });

  return { ok: true, affected: { orders } };
}

/**
 * Deletes a customer account: anonymizes their records, removes their profile
 * and wellness data, then deletes the auth user. Used by self-serve deletion
 * and by admin hard-delete.
 */
export async function deleteCustomerAccount(
  userId: string,
  email: string | null,
  requestedBy: string
): Promise<PrivacyResult> {
  const orders = await scrubUser(userId, email);
  await supabaseAdmin.from("reviews").delete().eq("customer_id", userId);
  await supabaseAdmin.from("profiles").delete().eq("id", userId);
  // Finally remove the login itself (best-effort).
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  await logRequest({
    kind: "DELETE",
    subject_type: "customer",
    subject_email: email,
    subject_id: userId,
    requested_by: requestedBy,
    note: error
      ? `Data scrubbed (${orders} orders); auth delete failed: ${error.message}`
      : `Account + data deleted (${orders} orders anonymized).`,
  });

  return { ok: true, affected: { orders } };
}

/** Admin: anonymize a vendor's PII (keeps the store record + products). */
export async function anonymizeVendor(
  vendorId: string,
  requestedBy: string
): Promise<PrivacyResult> {
  const { error } = await supabaseAdmin
    .from("vendors")
    .update({
      contact_person: null,
      contact_email: null,
      contact_phone: null,
      address_line: null,
      pan: null,
      bank_account_number: null,
      bank_account_holder: null,
      bank_ifsc: null,
      is_approved: false,
    })
    .eq("id", vendorId);
  if (error) return { ok: false, error: error.message };

  await logRequest({
    kind: "ANONYMIZE",
    subject_type: "vendor",
    subject_id: vendorId,
    requested_by: requestedBy,
    note: "Vendor PII cleared; store set to pending.",
  });
  return { ok: true };
}

export interface DataRequestRow {
  id: string;
  kind: string;
  subject_type: string;
  subject_email: string | null;
  requested_by: string | null;
  note: string | null;
  created_at: string;
}

export async function getDataRequests(limit = 50): Promise<DataRequestRow[]> {
  const { data } = await supabaseAdmin
    .from("data_requests")
    .select("id, kind, subject_type, subject_email, requested_by, note, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as DataRequestRow[];
}
