"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import type { StoreProduct } from "@/lib/publicData";
import { GOALS, getGoal, textMatchesGoal } from "@/lib/goals";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { track } from "@/lib/track";

type Diet = "ANY" | "VEG" | "VEGAN";
type Budget = "ANY" | "LOW" | "MID" | "HIGH";

const DIETS: { value: Diet; label: string }[] = [
  { value: "ANY", label: "No preference" },
  { value: "VEG", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
];

const FORMS = ["No preference", "Capsule", "Tablet", "Powder", "Gummy", "Liquid"];

const BUDGETS: { value: Budget; label: string }[] = [
  { value: "ANY", label: "Any budget" },
  { value: "LOW", label: "Under ₹500" },
  { value: "MID", label: "₹500 – ₹1,000" },
  { value: "HIGH", label: "Over ₹1,000" },
];

interface Scored {
  product: StoreProduct;
  score: number;
  reasons: string[];
}

function haystack(p: StoreProduct): string {
  return [
    p.title,
    p.brand,
    p.description ?? "",
    p.attributes.map((a) => `${a.label} ${a.value}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function attrText(p: StoreProduct): string {
  return p.attributes.map((a) => `${a.label} ${a.value}`).join(" ").toLowerCase();
}

export default function WellnessFinder({ products }: { products: StoreProduct[] }) {
  const [step, setStep] = React.useState(0);
  const [goals, setGoals] = React.useState<string[]>([]);
  const [need, setNeed] = React.useState("");
  const [diet, setDiet] = React.useState<Diet>("ANY");
  const [form, setForm] = React.useState("No preference");
  const [budget, setBudget] = React.useState<Budget>("ANY");
  const [submitted, setSubmitted] = React.useState(false);

  const totalSteps = 4;

  function toggleGoal(slug: string) {
    setGoals((g) => (g.includes(slug) ? g.filter((s) => s !== slug) : [...g, slug]));
  }

  function reset() {
    setStep(0);
    setGoals([]);
    setNeed("");
    setDiet("ANY");
    setForm("No preference");
    setBudget("ANY");
    setSubmitted(false);
  }

  const results = React.useMemo<Scored[]>(() => {
    if (!submitted) return [];
    const needTokens = need
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2);

    const scored = products.map<Scored>((p) => {
      let score = 0;
      const reasons: string[] = [];
      const hay = haystack(p);

      for (const slug of goals) {
        const goal = getGoal(slug);
        if (!goal) continue;
        if (p.goals.includes(slug) || textMatchesGoal(hay, goal)) {
          score += 3;
          reasons.push(goal.label);
        }
      }

      let needHit = false;
      for (const tok of needTokens) {
        if (hay.includes(tok)) needHit = true;
      }
      if (needHit) {
        score += 2;
        reasons.push("Matches your description");
      }

      const at = attrText(p);
      if (diet !== "ANY") {
        if (diet === "VEGAN" && at.includes("vegan")) score += 1;
        else if (diet === "VEG" && (at.includes("veg") || at.includes("vegetarian"))) score += 1;
      }
      if (form !== "No preference" && at.includes(form.toLowerCase())) score += 1;

      if (budget !== "ANY") {
        const inRange =
          (budget === "LOW" && p.price < 500) ||
          (budget === "MID" && p.price >= 500 && p.price <= 1000) ||
          (budget === "HIGH" && p.price > 1000);
        if (inRange) score += 1;
      }

      return { product: p, score, reasons: Array.from(new Set(reasons)) };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
      .slice(0, 8);
  }, [submitted, products, goals, need, diet, form, budget]);

  const canProceed = step > 0 || goals.length > 0 || need.trim().length > 0;

  /* ---------------- Results view ---------------- */
  if (submitted) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Your matches
            </h2>
            <p className="mt-1 text-sm text-mist">
              {results.length > 0
                ? `${results.length} verified product${results.length === 1 ? "" : "s"} based on your answers`
                : "No close matches yet — try broadening your goals."}
            </p>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-coral/25 bg-white px-4 py-2 text-sm font-bold text-coral-700 transition-colors hover:bg-coral/5"
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </button>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-coral/15 bg-white px-6 py-14 text-center shadow-card">
            <p className="text-sm text-mist">
              We couldn&apos;t find a strong match. Browse the full catalogue or
              try different goals.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={reset}
                className="rounded-full border border-coral/25 px-5 py-2.5 text-sm font-bold text-coral-700 hover:bg-coral/5"
              >
                Try again
              </button>
              <a
                href="/products"
                className="rounded-full bg-citrus-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow-coral"
              >
                Browse all products
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map(({ product, reasons }) => (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card"
              >
                <a
                  href={`/product/${product.id}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25 text-coral-600"
                >
                  <span className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
                    <FlaskConical className="h-14 w-14" strokeWidth={1.1} />
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-coral-600 shadow-float backdrop-blur">
                    <ShieldCheck className="h-3 w-3" />
                    Verified vendor
                  </span>
                  {product.discount && (
                    <span className="absolute left-3 top-3 rounded-full bg-citrus-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow-berry">
                      {product.discount}
                    </span>
                  )}
                </a>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-berry">
                    {product.brand}
                  </p>
                  <a
                    href={`/product/${product.id}`}
                    className="mt-1 text-sm font-bold leading-snug text-ink transition-colors hover:text-coral-700"
                  >
                    {product.title}
                  </a>
                  {reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reasons.slice(0, 3).map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-medium text-coral-700"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="flex items-baseline gap-1.5">
                      <span className="font-serif text-lg font-semibold text-ink">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.discount && (
                        <span className="text-xs text-mist line-through">
                          ₹{product.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </span>
                    <AddToCartButton
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      brand={product.brand}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 rounded-2xl bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-mist">
          These are suggestions for everyday wellness support based on your
          answers — not medical advice. Products are nutraceuticals / dietary
          supplements and are not intended to diagnose, treat, cure or prevent
          any disease. Consult a qualified healthcare professional before use.
        </p>
      </div>
    );
  }

  /* ---------------- Quiz view ---------------- */
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-card sm:p-8">
      {/* progress */}
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-citrus-gradient" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            What would you like to support?
          </h2>
          <p className="mt-1 text-sm text-mist">
            Pick one or more goals. You can change these anytime.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {GOALS.map((g) => {
              const on = goals.includes(g.slug);
              return (
                <button
                  key={g.slug}
                  onClick={() => toggleGoal(g.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    on
                      ? "border-coral-500 bg-citrus-gradient text-white shadow-glow-coral"
                      : "border-coral/20 bg-white text-ink/70 hover:bg-coral/5"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            In a few words, what are you looking for?
          </h2>
          <p className="mt-1 text-sm text-mist">
            Optional — e.g. &ldquo;better sleep and less stress&rdquo; or
            &ldquo;omega-3 for my heart&rdquo;.
          </p>
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            rows={4}
            placeholder="Type here…"
            className="mt-4 w-full rounded-2xl border border-coral/20 bg-white p-4 text-sm text-ink outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Any dietary preference?
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDiet(d.value)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    diet === d.value
                      ? "border-coral-500 bg-citrus-gradient text-white"
                      : "border-coral/20 bg-white text-ink/70 hover:bg-coral/5"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">
              Preferred form?
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {FORMS.map((f) => (
                <button
                  key={f}
                  onClick={() => setForm(f)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form === f
                      ? "border-coral-500 bg-citrus-gradient text-white"
                      : "border-coral/20 bg-white text-ink/70 hover:bg-coral/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            What&apos;s your budget per product?
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                  budget === b.value
                    ? "border-coral-500 bg-citrus-gradient text-white"
                    : "border-coral/20 bg-white text-ink/70 hover:bg-coral/5"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* nav buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-mist transition-colors hover:text-coral-600 disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {step < totalSteps - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !canProceed}
            className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-7 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step === 0 && !canProceed ? "Pick a goal to continue" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              track("finder_complete", {
                meta: { goals: goals.length, hasText: need.trim().length > 0 },
              });
              setSubmitted(true);
            }}
            className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-7 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            See my matches
          </button>
        )}
      </div>
    </div>
  );
}
