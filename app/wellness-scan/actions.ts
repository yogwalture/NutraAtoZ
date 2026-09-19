"use server";

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getStoreProducts, type StoreProduct } from "@/lib/publicData";
import { GOALS } from "@/lib/goals";
import {
  buildReport,
  QUESTIONS,
  type BasicDetails,
  type ScanAnswers,
  type ScanReport,
  type Sex,
  type ActivityLevel,
  type NutrientRec,
} from "@/lib/wellness";

export interface ScanRecProduct {
  product: StoreProduct;
  /** Names of the recommended nutrients this product helps address. */
  reasons: string[];
}

export interface RunScanResult {
  ok: boolean;
  needAuth?: boolean;
  error?: string;
  report?: ScanReport;
  products?: ScanRecProduct[];
  scanId?: string;
}

const SEXES: Sex[] = ["male", "female", "other"];
const ACTIVITIES: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
const GOAL_SLUGS = new Set(GOALS.map((g) => g.slug));

function clampNum(v: unknown, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** Sanitize raw client input into a trusted BasicDetails + ScanAnswers pair. */
function sanitize(
  rawDetails: BasicDetails,
  rawAnswers: ScanAnswers
): { details: BasicDetails; answers: ScanAnswers } {
  const sex: Sex = SEXES.includes(rawDetails.sex) ? rawDetails.sex : "other";
  const activity: ActivityLevel = ACTIVITIES.includes(rawDetails.activity)
    ? rawDetails.activity
    : "sedentary";

  const details: BasicDetails = {
    sex,
    age: Math.round(clampNum(rawDetails.age, 14, 100)),
    heightCm: Math.round(clampNum(rawDetails.heightCm, 80, 250)),
    weightKg: Math.round(clampNum(rawDetails.weightKg, 25, 300)),
    activity,
    pregnant: sex === "female" ? Boolean(rawDetails.pregnant) : false,
    medical: Boolean(rawDetails.medical),
  };

  const responses: Record<string, string> = {};
  const validIds = new Map(QUESTIONS.map((q) => [q.id, q]));
  const raw = rawAnswers?.responses ?? {};
  for (const [qid, val] of Object.entries(raw)) {
    const q = validIds.get(qid);
    if (!q) continue;
    if (typeof val === "string" && q.options.some((o) => o.value === val)) {
      responses[qid] = val;
    }
  }

  const focus = Array.isArray(rawAnswers?.focus)
    ? rawAnswers.focus.filter((s) => typeof s === "string" && GOAL_SLUGS.has(s)).slice(0, 12)
    : [];

  return { details, answers: { responses, focus } };
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

/** Match live products to the recommended nutrients, with per-product reasons. */
function matchProducts(
  products: StoreProduct[],
  nutrients: NutrientRec[]
): ScanRecProduct[] {
  const scored = products.map((p) => {
    const hay = haystack(p);
    const reasons: string[] = [];
    let score = 0;
    for (const n of nutrients) {
      const kwHit = n.keywords.some((k) => hay.includes(k.toLowerCase()));
      const goalHit = p.goals.includes(n.goalSlug);
      if (kwHit || goalHit) {
        // keyword match is more specific than a goal-tag match
        score += n.score * (kwHit ? 1 : 0.6);
        reasons.push(n.name);
      }
    }
    return { product: p, reasons: Array.from(new Set(reasons)), score };
  });

  return scored
    .filter((s) => s.reasons.length > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 8)
    .map(({ product, reasons }) => ({ product, reasons }));
}

/**
 * Run a Wellness Scan. Requires an authenticated customer (the flow gates on
 * account creation before this is called). Builds the report, matches live
 * products, and persists the scan to the user's history.
 */
export async function runWellnessScan(
  rawDetails: BasicDetails,
  rawAnswers: ScanAnswers
): Promise<RunScanResult> {
  if (!isSupabaseAdminConfigured)
    return { ok: false, error: "The scan backend is not configured yet." };

  // Auth gate — resolve the signed-in user from the session cookie.
  let userId: string | null = null;
  try {
    const supa = createSupabaseServerClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }
  if (!userId) return { ok: false, needAuth: true };

  const { details, answers } = sanitize(rawDetails, rawAnswers);
  const report = buildReport(details, answers);

  let products: ScanRecProduct[] = [];
  try {
    const live = await getStoreProducts(300);
    products = matchProducts(live, report.nutrients);
  } catch {
    products = [];
  }

  // Persist (best-effort — a save failure shouldn't block the user's report).
  let scanId: string | undefined;
  try {
    const nutrientScores: Record<string, number> = {};
    for (const n of report.nutrients) nutrientScores[n.key] = n.score;

    const { data, error } = await supabaseAdmin
      .from("wellness_scans")
      .insert({
        user_id: userId,
        sex: details.sex,
        age: details.age,
        height_cm: details.heightCm,
        weight_kg: details.weightKg,
        activity_level: details.activity,
        bmi: report.body.bmi,
        bmr: report.body.bmr,
        tdee: report.body.tdee,
        answers: { responses: answers.responses, focus: answers.focus },
        nutrient_scores: nutrientScores,
        recommended_nutrients: report.nutrients.map((n) => ({
          key: n.key,
          name: n.name,
        })),
        recommended_goals: report.goals,
        report,
      })
      .select("id")
      .maybeSingle();
    if (!error) scanId = data?.id as string | undefined;
  } catch {
    // ignore persistence failure
  }

  return { ok: true, report, products, scanId };
}
