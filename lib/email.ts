import nodemailer from "nodemailer";

/**
 * Transactional email with two interchangeable backends:
 *
 *  1. SMTP (preferred) — e.g. Gmail SMTP, so mail is sent FROM your own
 *     address (nutraatoz@gmail.com). Set:
 *       SMTP_HOST   (default smtp.gmail.com)
 *       SMTP_PORT   (default 465)
 *       SMTP_USER   e.g. nutraatoz@gmail.com
 *       SMTP_PASS   a Gmail "App Password" (16 chars, 2FA required)
 *       EMAIL_FROM  e.g. "Nutraatoz <nutraatoz@gmail.com>"
 *
 *  2. Resend HTTP API — set RESEND_API_KEY (+ EMAIL_FROM on a verified domain).
 *
 * If neither is configured the admin still gets a copyable link; nothing
 * breaks.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

function smtpConfigured(): boolean {
  return (
    !!(process.env.SMTP_USER || process.env.SMTP_HOST) && !!process.env.SMTP_PASS
  );
}

function resendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function isMailerConfigured(): boolean {
  return smtpConfigured() || resendConfigured();
}

function fromAddress(): string {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (process.env.SMTP_USER) return `Nutraatoz <${process.env.SMTP_USER}>`;
  return "Nutraatoz <onboarding@resend.dev>";
}

interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendViaSmtp(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  try {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from: fromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "SMTP send failed" };
  }
}

async function sendViaResend(params: {
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

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (smtpConfigured()) return sendViaSmtp(params);
  if (resendConfigured()) return sendViaResend(params);
  return { ok: false, error: "No email backend configured" };
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
