# NutraAtoZ — Audit & Production Roadmap

_Marketplace transformation plan. Audit of the existing MVP (live at nutraatoz.com), then a
prioritized roadmap (P0→P3). Nothing below fabricates data; where the platform claims something
today that isn't operationally true, it's flagged as a compliance fix._

---

## 1. Current state — what actually exists

**Stack:** Next.js 14 (App Router, RSC, server actions) · TypeScript · Tailwind + custom design system ·
Supabase (Postgres, Auth, Storage) · Razorpay SDK (code only) · Hosted on Hostinger (GitHub auto-deploy).

**Storefront:** homepage (3D hero, marquee, categories, products, CTA, footer), `/products`, `/cart`,
COD `/checkout` (writes real orders), `/search`, customer `/login` + `/account` (Supabase auth),
content pages (about/contact/faq/shipping/returns/lab-reports/careers), brand logo, social links.

**Vendor:** `/vendor/onboarding` (5-step, writes to DB via service-role server action),
`/vendor/dashboard` (overview/products/orders/payouts) with add/edit/delete products (discount +
attributes; commission is admin-controlled, not vendor-set).

**Admin:** `/admin` (Supabase-auth gated) — vendors (add/edit/approve/delete), products
(add/edit/hide/delete), orders, and a commission portal (platform default + per-vendor + earnings).

**Database:** `products` (price, discount, attributes, commission_pct, is_active…), `vendors` (GSTIN,
PAN, FSSAI, bank, commission_pct, is_approved…), `platform_settings`, `orders`, `order_items`,
`profiles` (role: admin/vendor/customer). RLS enabled; auto-admin trigger for the owner email.

---

## 2. Audit — KEEP / IMPROVE / REBUILD / ADD

### KEEP (solid foundations — do not rebuild)
- Next.js 14 + Supabase + server-action architecture; deploy pipeline.
- Admin console with real auth + full vendor/product CRUD + commission portal (15% model works).
- Product data model (discount type/value, attributes JSONB, commission_pct) and paise-safe money math.
- COD checkout writing real orders with commission/payout split.
- Customer auth (Supabase), search, content pages, brand logo, responsive citrus design system.
- Vendor onboarding capturing GSTIN/PAN/FSSAI + certificate upload (service-role, RLS-safe).

### IMPROVE (functional but weak)
- **Homepage categories** use hardcoded placeholder data → must be driven by real inventory/taxonomy.
- **Product page** is a simple card; needs the full trust layout (ingredients table, docs, vendor block,
  PIN delivery check, disclaimer).
- **Search** is client-side substring over titles; needs category/ingredient/goal/brand filters + facets.
- **SEO** is basic metadata only; no sitemap, robots, structured data, category/ingredient landing pages.
- **Vendor dashboard** analytics are minimal; documents/settlements views are light.

### REBUILD (architectural gaps)
- **Vendor authentication.** _Biggest gap._ Vendors cannot actually log in — the dashboard resolves a
  single demo vendor via `DEMO_VENDOR_ID`. Needs real vendor Supabase auth mapped to a `vendors` row,
  scoping every query/mutation to the logged-in vendor (replacing the demo cookie).
- **"Lab-Tested" / CoA language.** The site broadly says "lab-tested" — the master prompt correctly flags
  this as ambiguous/compliance-risky. Rebuild into an explicit, tiered trust model (Vendor-provided CoA /
  NutraAtoZ-reviewed / Independently tested) and never imply a higher tier than reality.
- **CoA / document system.** Today CoA is only prose. Needs a real documents model (product ↔ batch ↔
  CoA file, lab, dates, status) with a viewer and admin review states.

### ADD (missing entirely)
- Compliance flagging workflow (GREEN/AMBER/RED) in product publishing.
- Need-based discovery (wellness goals wired to real product metadata) + AI Wellness/Product Finder.
- `/sell-on-nutraatoz` B2B acquisition landing page + "How Vendor Earnings Work" calculator + Founding
  Vendor program + Vendor Centre/help.
- Assisted onboarding (CSV/Excel/PDF → AI product draft → vendor approval).
- Reviews (verified-purchase only), PIN-code delivery check, real shipping integration, prepaid payments
  (Razorpay keys), document-expiry alerts (FSSAI/CoA).
- Vendor CRM + AI vendor-acquisition suite (research, lead scoring, outreach, readiness report, chatbot).
- Marketplace analytics (active vendors, first-order vendors, GMV, funnels) + attribution.

---

## 3. Compliance guardrails (apply to everything)
- No medical diagnosis, disease/cure claims, or "you have a deficiency" language. Use "wellness goals /
  nutritional interests."
- Distinguish **Vendor-provided CoA** vs **NutraAtoZ-reviewed** vs **Independently tested** — never blur.
- No fabricated vendors, products, reviews, ratings, sales, lab results, FSSAI status, or testimonials.
  Demo data must be labelled "Demo" or removed from production.
- AI assists humans; it never makes final legal/medical/regulatory decisions. Flagged claims → human review.

---

## 4. Prioritized roadmap

### P0 — Critical (trust, compliance, correctness) — ship first
1. **Compliance language pass** — replace ambiguous "lab-tested" with the tiered trust model; add proper
   nutraceutical disclaimers site-wide. _(mostly copy + a small badge component; fast, high-impact)_
2. **Legal/policy pages** — Terms, Privacy, Vendor Agreement, Refund/Return, Shipping policy (real).
3. **Remove/label placeholder data** — homepage category counts, any demo figures → real or "Demo".
4. **Payment messaging honesty** — COD is live; prepaid is "coming soon" until Razorpay keys are set.
5. **CoA/trust badges** driven by real product/vendor fields only.
6. **Vendor agreement + 15% commercial terms page** (commission, settlement, charges — only confirmed 15%).

### P1 — High (core marketplace) 
7. **Real vendor authentication** (replace DEMO_VENDOR_ID) — the unlock for a true two-sided marketplace.
8. **`/sell-on-nutraatoz`** B2B landing + earnings calculator + Founding Vendor program.
9. **Product page redesign** (ingredients table, docs, vendor block, PIN check, disclaimer).
10. **CoA / document system** (product↔batch↔file, statuses, viewer).
11. **Need-based discovery** — wellness-goal taxonomy on real products; category/ingredient pages.
12. **AI Wellness/Product Finder** (preference-based, compliance-safe, filters inactive/undocumented).
13. **Reviews** (verified-purchase) + **PIN delivery check**.
14. **Analytics + funnels** (active vendors, first-order vendors, GMV).

### P2 — Growth
15. Vendor CRM (lead → active-vendor pipeline) + AI lead scoring (editable weights).
16. Assisted onboarding (CSV/PDF → AI draft → approval) + AI compliance flagging (GREEN/AMBER/RED).
17. AI vendor research + outreach drafting + Marketplace Readiness Report lead magnet + vendor chatbot.
18. SEO expansion (sitemap, robots, schema, category/ingredient/learn pages) + content engine.
19. Document-expiry alerts; vendor referral program.

### P3 — Scale
20. Prepaid payments (Razorpay Route split settlements once keys provided) + shipping integration.
21. Advanced recommendations/personalization, predictive vendor-success analytics.

---

## 5. Reality checks (need your input / external setup)
- **Razorpay keys** — required before any prepaid/online payments or split settlements can go live.
- **Shipping** — no courier integration yet; need a provider (Shiprocket/Delhivery/etc.) + serviceable pincodes.
- **AI vendor "lead discovery"** — must respect privacy/anti-spam/platform ToS; build controlled, consented
  outreach only (no mass scraping/spam).
- **Independent testing claims** — only usable if NutraAtoZ actually commissions lab tests.
- **Real numbers** — vendor counts, ratings, orders shown publicly must be real (start from actual data).

---

## 6. Suggested first execution slice (2–3 focused deploys)
Because it's the highest trust/compliance leverage and mostly non-destructive:
**P0 #1–#5** (compliance language + tiered CoA badges + policy pages + honest payment messaging + real
category data) → then **P1 #7 (real vendor auth)** as the first architectural unlock.
