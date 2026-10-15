/**
 * Transactional email via Resend's HTTP API (no SDK dependency — just fetch).
 *
 * Enabled only when RESEND_API_KEY is set. When it is not, callers fall back
 * to Supabase's built-in email, so nothing breaks before a provider is wired.
 *
 * Env:
 *   RESEND_API_KEY   server-only API key from resend.com
 *   EMAIL_FROM       e.g. "Nutraatoz <no-reply@nutraatoz.com>"
 *                    (defaults to Resend's shared test sender)
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isMailerConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || "Nutraatoz <onboarding@resend.dev>";
}

interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

/** Branded "set your password" email sent to a vendor on approval. */
export async function sendVendorInviteEmail(params: {
  to: string;
  vendorName: string;
  actionLink: string;
}): Promise<SendResult> {
  const { to, vendorName, actionLink } = params;
  const safeName = escapeHtml(vendorName);
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FFF8F0;font-family:Arial,Helvetica,sans-serif;color:#2b1a12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
          <tr><td style="background:linear-gradient(135deg,#FF6B4A,#E63980);padding:24px 28px;">
            <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">nutraAtoz</span>
          </td></tr>
          <tr><td style="padding:32px 28px;">
            <h1 style="margin:0 0 12px;font-size:22px;color:#17382f;">Your vendor account is approved 🎉</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
              Hi ${safeName}, welcome to Nutraatoz. Your application has been approved.
              Set your password to activate your account and access your vendor dashboard.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr><td style="border-radius:999px;background:linear-gradient(135deg,#FF6B4A,#E63980);">
                <a href="${actionLink}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:999px;">
                  Set my password
                </a>
              </td></tr>
            </table>
            <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#7a6a60;">
              This link is single-use and expires for your security. If the button doesn't work,
              copy and paste this URL into your browser:<br/>
              <a href="${actionLink}" style="color:#FF6B4A;word-break:break-all;">${actionLink}</a>
            </p>
            <p style="margin:20px 0 0;font-size:13px;color:#7a6a60;">
              If you didn't apply to sell on Nutraatoz, you can safely ignore this email.
            </p>
          </td></tr>
          <tr><td style="padding:18px 28px;background:#FBF1EA;font-size:12px;color:#9a8a80;">
            Nutraatoz — India's verified nutraceutical marketplace.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to,
    subject: "Your Nutraatoz vendor account is approved — set your password",
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
