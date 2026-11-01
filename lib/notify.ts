import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isMailerConfigured, sendBrandedEmail } from "@/lib/email";
import { formatINR } from "@/lib/format";

const SITE_URL = "https://nutraatoz.com";

/** Resolve admin alert recipients: admin_emails table, else env fallback. */
export async function getAdminEmails(): Promise<string[]> {
  const { data } = await supabaseAdmin.from("admin_emails").select("email");
  const fromTable = (data ?? [])
    .map((r) => (r.email as string | null)?.trim())
    .filter((e): e is string => !!e);
  if (fromTable.length) return fromTable;
  const env =
    process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER || "";
  return env ? [env] : [];
}

async function alreadySent(dedupeKey: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("notifications_log")
    .select("id")
    .eq("dedupe_key", dedupeKey)
    .maybeSingle();
  return !!data;
}

interface SendArgs {
  template: string;
  to: string;
  subject: string;
  heading: string;
  lines: string[];
  actionLink?: string;
  buttonLabel?: string;
  dedupeKey?: string;
  orderId?: string;
  leadId?: string;
  vendorId?: string;
}

/**
 * Send one branded email, idempotently (when dedupeKey is given) and logged to
 * notifications_log. Never throws — a notification failure must not break the
 * surrounding flow. Returns true when an email was actually sent.
 */
export async function logAndSend(args: SendArgs): Promise<boolean> {
  try {
    if (!args.to) return false;
    if (args.dedupeKey && (await alreadySent(args.dedupeKey))) return false;

    if (!isMailerConfigured()) {
      await supabaseAdmin.from("notifications_log").insert({
        template: args.template,
        recipient: args.to,
        order_id: args.orderId ?? null,
        lead_id: args.leadId ?? null,
        vendor_id: args.vendorId ?? null,
        dedupe_key: args.dedupeKey ?? null,
        status: "SKIPPED",
        error: "No mailer configured",
      });
      return false;
    }

    const res = await sendBrandedEmail({
      to: args.to,
      subject: args.subject,
      heading: args.heading,
      lines: args.lines,
      actionLink: args.actionLink,
      buttonLabel: args.buttonLabel,
    });

    await supabaseAdmin.from("notifications_log").insert({
      template: args.template,
      recipient: args.to,
      order_id: args.orderId ?? null,
      lead_id: args.leadId ?? null,
      vendor_id: args.vendorId ?? null,
      dedupe_key: args.dedupeKey ?? null,
      status: res.ok ? "SENT" : "FAILED",
      error: res.ok ? null : res.error ?? "send failed",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Event notifications
 * ------------------------------------------------------------------ */

export async function notifyOrderConfirmation(o: {
  id: string;
  email: string | null;
  total: number;
  name?: string | null;
}) {
  if (!o.email) return;
  await logAndSend({
    template: "order_confirmation",
    to: o.email,
    orderId: o.id,
    dedupeKey: `order_confirm:${o.id}`,
    subject: "Your Nutraatoz order is confirmed",
    heading: "Thanks for your order! 🎉",
    lines: [
      `Hi ${o.name || "there"}, we've received your order and payment of ${formatINR(o.total)}.`,
      `Order reference: #${o.id.slice(0, 8)}.`,
      "We'll let you know as soon as it ships. You can track it from this email once it's dispatched.",
    ],
    actionLink: `${SITE_URL}/products`,
    buttonLabel: "Continue shopping",
  });
}

const SHIP_COPY: Record<string, { subject: string; heading: string; line: string }> = {
  SHIPPED: {
    subject: "Your Nutraatoz order has shipped",
    heading: "Your order is on its way 🚚",
    line: "Your order has been dispatched and is on its way to you.",
  },
  DELIVERED: {
    subject: "Your Nutraatoz order was delivered",
    heading: "Delivered ✅",
    line: "Your order has been delivered. We hope you love it!",
  },
};

export async function notifyShippingUpdate(o: {
  id: string;
  email: string | null;
  status: string;
  trackingUrl?: string | null;
}) {
  if (!o.email) return;
  const copy = SHIP_COPY[o.status];
  if (!copy) return; // only notify on meaningful milestones
  await logAndSend({
    template: `shipping_${o.status.toLowerCase()}`,
    to: o.email,
    orderId: o.id,
    dedupeKey: `ship:${o.id}:${o.status}`,
    subject: copy.subject,
    heading: copy.heading,
    lines: [copy.line, `Order reference: #${o.id.slice(0, 8)}.`],
    actionLink: o.trackingUrl ?? undefined,
    buttonLabel: o.trackingUrl ? "Track your package" : undefined,
  });
}

export async function notifyNewEnquiry(lead: {
  id: string;
  company_name: string;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  city?: string | null;
  product_category?: string | null;
}) {
  const admins = await getAdminEmails();
  for (const to of admins) {
    await logAndSend({
      template: "enquiry_alert",
      to,
      leadId: lead.id,
      dedupeKey: `enquiry:${lead.id}:${to}`,
      subject: `New vendor enquiry: ${lead.company_name}`,
      heading: "New vendor enquiry 📩",
      lines: [
        `${lead.company_name}${lead.product_category ? ` — ${lead.product_category}` : ""}`,
        `Contact: ${lead.contact_name || "—"} · ${lead.contact_phone || lead.contact_email || "no contact"}${lead.city ? ` · ${lead.city}` : ""}`,
        "Open the agent portal to assign and follow up.",
      ],
      actionLink: `${SITE_URL}/admin/leads`,
      buttonLabel: "View leads",
    });
  }
}

export async function notifyReviewRequest(o: {
  id: string;
  email: string | null;
  name?: string | null;
}) {
  if (!o.email) return;
  await logAndSend({
    template: "review_request",
    to: o.email,
    orderId: o.id,
    dedupeKey: `review:${o.id}`,
    subject: "How was your Nutraatoz order?",
    heading: "Mind leaving a quick review?",
    lines: [
      `Hi ${o.name || "there"}, we'd love to hear how your recent order worked out.`,
      "Your honest review helps other shoppers and the vendors on our marketplace.",
    ],
    actionLink: `${SITE_URL}/products`,
    buttonLabel: "Write a review",
  });
}

export async function notifyFssaiExpiry(v: {
  id: string;
  email: string | null;
  storeName: string;
  expiry: string;
  daysLeft: number;
}) {
  const bucket = v.expiry.slice(0, 7); // dedupe once per month per vendor
  if (v.email) {
    await logAndSend({
      template: "fssai_expiry_vendor",
      to: v.email,
      vendorId: v.id,
      dedupeKey: `fssai:${v.id}:${bucket}`,
      subject: "Your FSSAI licence is expiring soon",
      heading: "Renew your FSSAI licence",
      lines: [
        `Hi ${v.storeName}, your FSSAI licence on Nutraatoz expires on ${v.expiry} (${v.daysLeft} day(s) left).`,
        "Products stay hidden from the storefront once the licence lapses. Please renew and update your details to keep selling.",
      ],
      actionLink: `${SITE_URL}/vendor/dashboard`,
      buttonLabel: "Update my details",
    });
  }
  const admins = await getAdminEmails();
  for (const to of admins) {
    await logAndSend({
      template: "fssai_expiry_admin",
      to,
      vendorId: v.id,
      dedupeKey: `fssai_admin:${v.id}:${bucket}:${to}`,
      subject: `Vendor FSSAI expiring: ${v.storeName}`,
      heading: "Vendor FSSAI licence expiring",
      lines: [
        `${v.storeName} — FSSAI expires ${v.expiry} (${v.daysLeft} day(s) left).`,
      ],
      actionLink: `${SITE_URL}/admin/vendors`,
      buttonLabel: "View vendors",
    });
  }
}

export async function notifyFollowupDigest(d: {
  to: string;
  agentId: string;
  day: string;
  count: number;
  label: string;
}) {
  await logAndSend({
    template: "followup_digest",
    to: d.to,
    dedupeKey: `followups:${d.agentId}:${d.day}`,
    subject: `You have ${d.count} lead(s) to follow up today`,
    heading: "Your call queue for today ☎️",
    lines: [
      `${d.label}`,
      `You have ${d.count} lead(s) due for a follow-up. Open your queue to start calling.`,
    ],
    actionLink: `${SITE_URL}/agent/queue`,
    buttonLabel: "Open call queue",
  });
}

export async function notifyStaleLeadsDigest(d: {
  to: string;
  key: string;
  day: string;
  count: number;
}) {
  await logAndSend({
    template: "stale_leads_digest",
    to: d.to,
    dedupeKey: `stale:${d.key}:${d.day}`,
    subject: `${d.count} lead(s) have gone quiet`,
    heading: "Leads needing attention",
    lines: [
      `${d.count} lead(s) haven't been contacted in a while and aren't live or lost yet.`,
      "Give them a nudge before they go cold.",
    ],
    actionLink: `${SITE_URL}/agent/leads`,
    buttonLabel: "Review leads",
  });
}
