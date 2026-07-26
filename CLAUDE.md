# CLAUDE.md

Guidance for working in this repository.

## Project

**Nutraatoz** — a premium, multi-vendor nutraceuticals marketplace for the
Indian market. Vendors self-onboard (FSSAI/GSTIN verified), list lab-tested
supplements, and receive split settlements via Razorpay Route; customers browse
a curated storefront.

## Tech stack

- **Framework:** Next.js 14 (App Router, React Server Components, server actions)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui primitives (Radix-based)
- **Icons:** lucide-react
- **Forms/validation:** react-hook-form + zod
- **Backend:** Supabase (PostgreSQL, Auth, Storage) with row-level security
- **Payments:** Razorpay Node SDK (Route / split settlements)
- **Fonts:** Inter (sans) + Fraunces (serif), loaded via `<link>` in the layout

## Build & dev commands

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (next/core-web-vitals)
npx tsc --noEmit   # type-check without emitting
```

CI runs `npm ci` → `lint` → `tsc --noEmit` → `build` on every push/PR to `main`
(`.github/workflows/ci.yml`).

## Project structure

```
app/
  layout.tsx                 root layout (fonts, metadata)
  page.tsx                   homepage shell
  vendor/onboarding/         multi-step vendor self-onboarding form
  vendor/dashboard/          vendor portal (overview, products, orders, payouts)
  api/checkout/              Razorpay Route order creation (split transfers)
  api/payment/verify/        payment signature verification
components/
  ui/                        shadcn primitives (button, input, card, badge, …)
  onboarding/                onboarding form + certificate upload
  dashboard/                 dashboard shell, stat cards, charts, products mgr
  SiteNav.tsx, Hero.tsx …    storefront sections
lib/
  validation.ts              GSTIN / FSSAI / PAN zod schemas + checksums
  razorpay.ts, routeSplit.ts Razorpay client + split-transfer computation
  supabase.ts                browser client (anon key)
  supabaseAdmin.ts           server client (service role — never import client-side)
  vendorData.ts              server-only, vendor-scoped data fetchers
  format.ts                  ₹ / number / date helpers
```

## Coding guidelines

### General

- TypeScript strict mode. No `any` unless unavoidable; prefer precise types.
- Keep Server Components the default. Add `"use client"` only when a component
  needs state, effects, or browser APIs.
- When a client component needs a type from a server-only module, import it with
  `import type { … }` so the server module is never bundled to the client.
- Mutations use **server actions** (`"use server"`) and call `revalidatePath`.

### Styling

- Brand tokens live in `tailwind.config.ts`. Use the named/semantic classes,
  not raw hex:
  - Background — Alabaster Cream `#FAF9F6` (`bg-background` / `bg-alabaster`)
  - Primary — Emerald Green `#0F4C43` (`bg-primary` / `text-emerald`)
  - Accent — Gold `#C9A24B` (`text-accent` / `text-gold`)
- shadcn semantic tokens (`primary`, `muted`, `border`, `card`, …) are HSL CSS
  vars defined in `app/globals.css`. Cards: `rounded-xl2`, `shadow-card`.
- Use `font-serif` (Fraunces) for headings, `font-sans` (Inter) for body.
- Responsive nav pattern: mobile = bottom bar, tablet = side drawer,
  desktop = full header.

### Money

- All payment math is done in **integer paise**. Convert rupees → paise with
  `Math.round(rupees * 100)`. Round commission, then derive the vendor payout by
  subtraction so the parts always reconcile to the captured amount.
- Display amounts with `formatINR` / `formatINRCompact` from `lib/format.ts`.

### Validation (Indian statutory formats)

- **GSTIN** — 15 chars; validate the regex, the embedded PAN, *and* the
  modulo-36 checksum (`isValidGSTIN`).
- **PAN** — 10 chars with a valid holder-type 4th character.
- **FSSAI** — exactly 14 digits, leading digit 1 or 2.
- Validate on the client AND re-validate server-side before any DB write.

### Security

- The Supabase **service-role** client (`lib/supabaseAdmin.ts`) bypasses RLS —
  use it only in server code, never import it into a client component.
- Scope every vendor query/mutation by `vendor_id` (defense in depth, even with
  RLS). The dashboard resolves the current vendor in `getVendorContext()`;
  replace that with Supabase Auth `auth.uid()` when login is added.
- Never commit secrets. `.env.local` is gitignored; keep `.env.example` updated.

## Environment variables

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only),
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_ADMIN_ACCOUNT_ID` (optional),
`DEFAULT_COMMISSION_PCT`, `DEMO_VENDOR_ID`.

## Database schema (Supabase / PostgreSQL)

Base tables:

- `profiles` — id, phone_number, role `['admin','vendor','customer']`
- `vendors` — id, company_name, gstin, fssai_license_no, fssai_expiry,
  razorpay_linked_id, is_approved
- `products` — id, vendor_id, title, description, price, commission_pct,
  ingredients, lab_tested_url, stock, weight_gms
- `orders` — id, customer_id, total_amount, payment_mode `['PREPAID','COD']`,
  marketing_source `['SOCIAL','OFFLINE_QR']`
- `order_items` — id, order_id, product_id, vendor_id, price, commission_amount,
  vendor_payout_amount

Columns the app expects beyond the base schema (add these):

- `vendors`: store_name, contact_person, contact_email, contact_phone,
  address_line, city, state, pincode, pan, fssai_certificate_url
- `products`: is_active (boolean, default true)
- `orders`: razorpay_order_id, razorpay_payment_id, status

### Row-level security

- Vendors may modify only products where `vendor_id == auth.uid()`.
- Products are publicly visible only when `is_approved == true` **and** the
  owning vendor's `fssai_expiry > CURRENT_DATE`.
