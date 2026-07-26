# Nutraatoz

A premium multi-vendor nutraceuticals marketplace — storefront, vendor
self-onboarding, Razorpay Route split settlements, and a vendor dashboard. Built
with **Next.js 14 (App Router)**, **Tailwind CSS**, **shadcn/ui**, and
**Supabase**.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # http://localhost:3000
```

Key routes: `/` (storefront), `/vendor/onboarding` (vendor sign-up),
`/vendor/dashboard` (vendor portal).

## Responsive navigation

`components/SiteNav.tsx` adapts across three breakpoints:

| Screen | Pattern |
| --- | --- |
| Mobile (`< 768px`) | Compact top bar + fixed bottom-bar navigation |
| Tablet (`768–1024px`) | Top bar with a hamburger that opens a side drawer |
| Desktop (`≥ 1024px`) | Full spacious header menu |

## Brand palette (`tailwind.config.ts`)

Alabaster Cream `#FAF9F6` (background), Emerald Green `#0F4C43` (primary),
Gold `#C9A24B` (accent).

## Vendor onboarding + Indian validation

`/vendor/onboarding` is a 3-step form (store, tax, compliance) with strict
client + server validation in `lib/validation.ts`:

- GSTIN — 15-char regex, embedded-PAN check, and modulo-36 checksum.
- PAN — 10-char format with valid holder-type character.
- FSSAI — exactly 14 digits, leading digit 1 or 2.

Certificate upload + submission go to Supabase (`lib/submitVendor.ts`).

## Razorpay Route — split settlements

`POST /api/checkout` reads each product's `commission_pct`, builds the dynamic
`transfers` payload (commission → admin account, remainder → each vendor's
`razorpay_linked_id`), and creates a Razorpay order that splits automatically on
capture. `POST /api/payment/verify` checks the HMAC signature. All money math is
in integer paise (`lib/routeSplit.ts`).

## Vendor dashboard

`/vendor/dashboard` — Overview (KPIs, SVG payout chart, recent orders),
Products (full CRUD via server actions), Orders, and Payouts & compliance. Data
is fetched server-side and scoped by vendor in `lib/vendorData.ts`.

Until auth exists, the current vendor resolves from a `vendor_id` cookie or the
`DEMO_VENDOR_ID` env var — set it to a row in your `vendors` table to see live
data. See `CLAUDE.md` for the full schema and required extra columns.
