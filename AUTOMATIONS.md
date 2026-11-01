# Automations, notifications & data revocation

This app runs its workflows **natively** (Next.js server actions + a secured
cron endpoint) — no external tool required. See "Native vs n8n" at the end for
when to reach for n8n instead.

## 1. Data revocation (privacy)

All customer/vendor data is stored by default in Supabase. Revocation is
available two ways, and every action is logged to `data_requests`:

- **Customer self-serve** — `/account` → "Delete my account & data". Deletes the
  login + wellness data and anonymizes order history.
- **Admin** — `/admin/privacy`:
  - *Anonymize* a customer by email (keeps anonymized orders for accounting).
  - *Delete* a customer's account + data.
  - Vendor PII can be anonymized via `adminAnonymizeVendor`.

Order **financial** rows (`order_items`, totals) are always preserved; only PII
(name, email, phone, address, wellness data) is stripped or removed.

## 2. Event-driven notifications (automatic, no setup)

Sent inline when the event happens, idempotent via `notifications_log`:

| Event | Email |
|---|---|
| Order paid (`/api/payment/verify`) | Order confirmation → customer |
| Shipment SHIPPED / DELIVERED (`/api/shiprocket/webhook`) | Status + tracking → customer |
| New vendor enquiry (`/become-a-vendor`) | Alert → admins |
| Vendor approved (existing) | Activation link → vendor |

## 3. Scheduled automations (need a scheduler)

Endpoint: `GET /api/cron?job=<name>&key=<CRON_SECRET>` (or `x-cron-key` header).
Jobs are idempotent, so re-running is safe.

| job | What it does | Suggested cadence |
|---|---|---|
| `followups` | Emails each agent their leads due today | daily, morning |
| `fssai-expiry` | Warns vendors + admins of FSSAI licences expiring ≤30 days | daily |
| `review-requests` | Asks customers to review orders delivered ≥2 days ago | daily |
| `stale-leads` | Nudges agents/admins about leads gone quiet (7 days) | daily |
| `all` | Runs every job | — |

### Wiring the scheduler (pick one)

- **Coolify scheduled task** (same VPS): add a scheduled command
  `curl -s "https://nutraatoz.com/api/cron?job=all&key=$CRON_SECRET"` daily.
- **cron-job.org** (free, external): a daily GET to the URL above.
- **Supabase pg_cron**: `select net.http_get('https://nutraatoz.com/api/cron?job=all&key=...')`.

## 4. Required env vars

```
CRON_SECRET=<long random string>          # protects /api/cron
ADMIN_ALERT_EMAIL=you@example.com          # fallback if admin_emails table empty
SMTP_USER / SMTP_PASS (or RESEND_API_KEY)  # email delivery (already set)
```

Admin alert recipients come from the `admin_emails` table first; otherwise
`ADMIN_ALERT_EMAIL`, otherwise `SMTP_USER`.

## 5. Native vs n8n

**Native (what's built here)** is best because every trigger already lives in
the app, it needs no extra hosting, and it shares the same DB + email setup.

**Reach for n8n** when you want non-developers to edit flows visually, fan out
to many third-party apps (WhatsApp, Slack, Sheets, CRMs) without code, or build
complex multi-step branching. To use it later, point n8n at the same endpoints:
it can call `/api/cron` on a schedule, and you can add outbound webhooks from
the app to n8n for event flows. SMS/WhatsApp channels aren't wired yet — those
need a provider (e.g. MSG91/Gupshup/Twilio) and are a natural n8n add-on.
