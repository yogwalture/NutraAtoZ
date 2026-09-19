/**
 * Wellness Scan engine — a deterministic, rule-based recommender.
 *
 * COMPLIANCE: This engine produces *general nutritional / wellness support*
 * suggestions only. It never diagnoses, treats, cures or prevents any disease,
 * and it is not a substitute for professional medical advice. Every output path
 * carries a disclaimer and, for sensitive inputs (pregnancy, stated medical
 * conditions), leads with a "consult a professional" flag.
 *
 * The engine is intentionally pure (no I/O, no Supabase) so it can run on the
 * server action and be unit-reasoned about. Product matching lives separately.
 */

/* ------------------------------------------------------------------ */
/* Basic profile                                                       */
/* ------------------------------------------------------------------ */

export type Sex = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface BasicDetails {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  /** Pregnant or breastfeeding — routes to a professional-consult flag. */
  pregnant?: boolean;
  /** Has a diagnosed medical condition / takes regular medication. */
  medical?: boolean;
}

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; help: string }[] = [
  { value: "sedentary", label: "Mostly sedentary", help: "Desk work, little exercise" },
  { value: "light", label: "Lightly active", help: "Light exercise 1–3 days/week" },
  { value: "moderate", label: "Moderately active", help: "Exercise 3–5 days/week" },
  { value: "active", label: "Very active", help: "Hard exercise 6–7 days/week" },
  { value: "very_active", label: "Athlete / physical job", help: "Very hard training or labour" },
];

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/* ------------------------------------------------------------------ */
/* Nutrient catalogue                                                  */
/* ------------------------------------------------------------------ */

export type NutrientKey =
  | "multivitamin"
  | "vitamin_d"
  | "vitamin_b12"
  | "b_complex"
  | "iron"
  | "omega_3"
  | "magnesium"
  | "probiotics"
  | "fiber"
  | "vitamin_c"
  | "zinc"
  | "ashwagandha"
  | "protein"
  | "calcium"
  | "collagen"
  | "coq10"
  | "folate";

export interface NutrientInfo {
  key: NutrientKey;
  /** Display name of the nutrient / supplement class. */
  name: string;
  /** Non-medical, benefit-led rationale. */
  why: string;
  /** Everyday food sources (dietary-first framing). */
  foods: string;
  /** Wellness goal this maps to (see lib/goals). */
  goalSlug: string;
  /** Keywords used to match live products. */
  keywords: string[];
  /** Fallback priority when scores tie (higher = surfaced first). */
  priority: number;
}

export const NUTRIENTS: Record<NutrientKey, NutrientInfo> = {
  multivitamin: {
    key: "multivitamin",
    name: "Daily Multivitamin",
    why: "A broad everyday base to help fill gaps when your diet varies day to day.",
    foods: "A varied, colourful plate of whole foods",
    goalSlug: "daily-essentials",
    keywords: ["multivitamin", "multi-vitamin", "multi ", "daily essential"],
    priority: 3,
  },
  vitamin_d: {
    key: "vitamin_d",
    name: "Vitamin D3",
    why: "Supports bones, muscle function and everyday immunity — often low when sun exposure is limited.",
    foods: "Sunlight, fortified milk, egg yolk, mushrooms",
    goalSlug: "immunity",
    keywords: ["vitamin d", "d3", "cholecalciferol", "d3 k2"],
    priority: 9,
  },
  vitamin_b12: {
    key: "vitamin_b12",
    name: "Vitamin B12",
    why: "Supports normal energy and the nervous system — commonly low on vegetarian and vegan diets.",
    foods: "Dairy, eggs (limited in plant diets — supplement helps)",
    goalSlug: "energy-vitality",
    keywords: ["b12", "cobalamin", "methylcobalamin"],
    priority: 8,
  },
  b_complex: {
    key: "b_complex",
    name: "B-Complex",
    why: "B-vitamins support everyday energy metabolism and help you feel less run-down.",
    foods: "Whole grains, legumes, leafy greens",
    goalSlug: "energy-vitality",
    keywords: ["b-complex", "b complex", "vitamin b", "b6", "b12"],
    priority: 6,
  },
  iron: {
    key: "iron",
    name: "Iron",
    why: "Supports normal energy and helps reduce everyday tiredness and fatigue.",
    foods: "Leafy greens, legumes, jaggery, dates",
    goalSlug: "energy-vitality",
    keywords: ["iron", "ferrous", "bisglycinate"],
    priority: 7,
  },
  omega_3: {
    key: "omega_3",
    name: "Omega-3 (EPA/DHA)",
    why: "Supports everyday heart and brain wellness — most Indian diets run low on it.",
    foods: "Fatty fish, flaxseed, walnuts, chia",
    goalSlug: "heart-health",
    keywords: ["omega", "epa", "dha", "fish oil", "flax", "algal"],
    priority: 8,
  },
  magnesium: {
    key: "magnesium",
    name: "Magnesium",
    why: "Supports muscle relaxation and restful, wind-down sleep.",
    foods: "Nuts, seeds, whole grains, dark chocolate",
    goalSlug: "sleep-calm",
    keywords: ["magnesium", "glycinate", "citrate"],
    priority: 7,
  },
  probiotics: {
    key: "probiotics",
    name: "Probiotics",
    why: "Friendly cultures to support digestive comfort and gut balance.",
    foods: "Yogurt, buttermilk, fermented foods",
    goalSlug: "gut-digestion",
    keywords: ["probiotic", "lactobacillus", "cultures", "gut"],
    priority: 6,
  },
  fiber: {
    key: "fiber",
    name: "Fibre",
    why: "Supports digestive regularity and everyday fullness.",
    foods: "Whole grains, fruit, vegetables, psyllium",
    goalSlug: "gut-digestion",
    keywords: ["fiber", "fibre", "psyllium", "isabgol", "prebiotic"],
    priority: 5,
  },
  vitamin_c: {
    key: "vitamin_c",
    name: "Vitamin C",
    why: "An antioxidant that supports everyday immunity and skin.",
    foods: "Citrus, amla, guava, bell peppers",
    goalSlug: "immunity",
    keywords: ["vitamin c", "ascorbic", "amla"],
    priority: 6,
  },
  zinc: {
    key: "zinc",
    name: "Zinc",
    why: "A mineral that supports the body's everyday immune defences.",
    foods: "Seeds, legumes, nuts, whole grains",
    goalSlug: "immunity",
    keywords: ["zinc"],
    priority: 5,
  },
  ashwagandha: {
    key: "ashwagandha",
    name: "Ashwagandha",
    why: "A traditional adaptogen used to support calm and everyday stress resilience.",
    foods: "—",
    goalSlug: "stress-mood",
    keywords: ["ashwagandha", "adaptogen", "ksm-66"],
    priority: 6,
  },
  protein: {
    key: "protein",
    name: "Protein",
    why: "Supports muscle maintenance, recovery and everyday satiety.",
    foods: "Dairy, eggs, legumes, paneer, soy",
    goalSlug: "fitness-recovery",
    keywords: ["protein", "whey", "isolate", "plant protein"],
    priority: 6,
  },
  calcium: {
    key: "calcium",
    name: "Calcium",
    why: "Supports bone strength and structure, alongside vitamin D.",
    foods: "Dairy, ragi, sesame, leafy greens",
    goalSlug: "bones-joints",
    keywords: ["calcium"],
    priority: 5,
  },
  collagen: {
    key: "collagen",
    name: "Collagen / Biotin",
    why: "Beauty-from-within support for skin, hair and nails.",
    foods: "Protein-rich foods, vitamin-C fruit",
    goalSlug: "skin-hair-nails",
    keywords: ["collagen", "biotin", "keratin", "glutathione"],
    priority: 4,
  },
  coq10: {
    key: "coq10",
    name: "CoQ10",
    why: "Supports cellular energy and heart wellness — the body makes less with age.",
    foods: "Organ meats, fatty fish, nuts",
    goalSlug: "heart-health",
    keywords: ["coq10", "ubiquinol", "coenzyme"],
    priority: 4,
  },
  folate: {
    key: "folate",
    name: "Folate",
    why: "Supports cell health and is especially important for women of child-bearing age.",
    foods: "Leafy greens, legumes, citrus",
    goalSlug: "womens-health",
    keywords: ["folate", "folic"],
    priority: 5,
  },
};

/* ------------------------------------------------------------------ */
/* Questionnaire                                                       */
/* ------------------------------------------------------------------ */

export interface QOption {
  value: string;
  label: string;
  /** Nutrient signals contributed when this option is chosen. */
  signals?: Partial<Record<NutrientKey, number>>;
}

export interface Question {
  id: string;
  prompt: string;
  help?: string;
  /** Short tag used as the "reason" shown next to a recommendation. */
  reason: string;
  options: QOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: "diet",
    prompt: "How would you describe your diet?",
    reason: "Your diet type",
    options: [
      { value: "balanced", label: "Balanced & varied" },
      {
        value: "vegetarian",
        label: "Vegetarian",
        signals: { vitamin_b12: 2, omega_3: 1, iron: 1 },
      },
      {
        value: "vegan",
        label: "Vegan / plant-based",
        signals: { vitamin_b12: 3, omega_3: 2, iron: 1, calcium: 1, vitamin_d: 1 },
      },
      {
        value: "processed",
        label: "Often processed / on-the-go",
        signals: { multivitamin: 2, fiber: 1 },
      },
    ],
  },
  {
    id: "fruit_veg",
    prompt: "How many servings of fruit & vegetables do you eat a day?",
    reason: "Low fruit & veg intake",
    options: [
      { value: "low", label: "0–1", signals: { vitamin_c: 2, fiber: 2, multivitamin: 1 } },
      { value: "some", label: "2–3", signals: { fiber: 1 } },
      { value: "plenty", label: "4 or more" },
    ],
  },
  {
    id: "sunlight",
    prompt: "How much time do you spend outdoors in daylight?",
    reason: "Limited sun exposure",
    options: [
      { value: "little", label: "Rarely — mostly indoors", signals: { vitamin_d: 3 } },
      { value: "some", label: "A little each day", signals: { vitamin_d: 1 } },
      { value: "plenty", label: "Plenty of sunlight" },
    ],
  },
  {
    id: "energy",
    prompt: "How are your energy levels on a typical day?",
    reason: "Low energy",
    options: [
      { value: "low", label: "Often tired / run-down", signals: { b_complex: 2, iron: 2, vitamin_b12: 1 } },
      { value: "mixed", label: "Up and down", signals: { b_complex: 1 } },
      { value: "good", label: "Consistently good" },
    ],
  },
  {
    id: "sleep",
    prompt: "How well do you sleep most nights?",
    reason: "Poor sleep",
    options: [
      { value: "poor", label: "Restless / hard to wind down", signals: { magnesium: 3, ashwagandha: 1 } },
      { value: "ok", label: "Okay, could be better", signals: { magnesium: 1 } },
      { value: "well", label: "I sleep well" },
    ],
  },
  {
    id: "stress",
    prompt: "How would you rate your everyday stress?",
    reason: "High stress",
    options: [
      { value: "high", label: "High / frequently stressed", signals: { ashwagandha: 3, magnesium: 1, b_complex: 1 } },
      { value: "moderate", label: "Moderate", signals: { ashwagandha: 1 } },
      { value: "low", label: "Low / relaxed" },
    ],
  },
  {
    id: "digestion",
    prompt: "Do you experience digestive discomfort (bloating, irregularity)?",
    reason: "Digestive comfort",
    options: [
      { value: "often", label: "Often", signals: { probiotics: 3, fiber: 1 } },
      { value: "sometimes", label: "Sometimes", signals: { fiber: 1 } },
      { value: "rarely", label: "Rarely" },
    ],
  },
  {
    id: "immunity",
    prompt: "How often do you catch colds or feel run-down?",
    reason: "Everyday immunity",
    options: [
      { value: "often", label: "Frequently", signals: { vitamin_c: 2, zinc: 2, vitamin_d: 1 } },
      { value: "sometimes", label: "Occasionally", signals: { vitamin_c: 1 } },
      { value: "rarely", label: "Rarely" },
    ],
  },
  {
    id: "training",
    prompt: "Do you train or do physical activity you recover from?",
    reason: "Training & recovery",
    options: [
      { value: "hard", label: "Strength / endurance training", signals: { protein: 3, omega_3: 1 } },
      { value: "light", label: "Light / occasional", signals: { protein: 1 } },
      { value: "none", label: "Not really" },
    ],
  },
  {
    id: "joints",
    prompt: "Any joint or bone concerns (stiffness, aches)?",
    reason: "Joint & bone support",
    options: [
      { value: "often", label: "Often", signals: { calcium: 2, vitamin_d: 1, omega_3: 1 } },
      { value: "sometimes", label: "Now and then", signals: { calcium: 1 } },
      { value: "no", label: "None" },
    ],
  },
  {
    id: "beauty",
    prompt: "Would you like support for skin, hair & nails?",
    reason: "Skin, hair & nails",
    options: [
      { value: "yes", label: "Yes, that's a priority", signals: { collagen: 3 } },
      { value: "no", label: "Not right now" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Body metrics                                                        */
/* ------------------------------------------------------------------ */

export interface BodyMetrics {
  bmi: number;
  bmiCategory: "Underweight" | "Healthy" | "Overweight" | "Higher range";
  bmr: number;
  tdee: number;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeBody(d: BasicDetails): BodyMetrics {
  const h = Math.max(80, Math.min(250, d.heightCm));
  const w = Math.max(25, Math.min(300, d.weightKg));
  const age = Math.max(14, Math.min(100, d.age));
  const meters = h / 100;
  const bmi = round1(w / (meters * meters));

  let bmiCategory: BodyMetrics["bmiCategory"];
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Healthy";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Higher range";

  // Mifflin-St Jeor
  const base = 10 * w + 6.25 * h - 5 * age;
  const bmrMale = base + 5;
  const bmrFemale = base - 161;
  const bmr =
    d.sex === "male" ? bmrMale : d.sex === "female" ? bmrFemale : (bmrMale + bmrFemale) / 2;

  const tdee = bmr * ACTIVITY_FACTOR[d.activity];

  return {
    bmi,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

export interface NutrientRec extends NutrientInfo {
  score: number;
  reasons: string[];
}

/** Answers: questionId -> chosen option value. focus: extra goal slugs. */
export interface ScanAnswers {
  responses: Record<string, string>;
  focus: string[];
}

export function scoreNutrients(
  details: BasicDetails,
  answers: ScanAnswers
): NutrientRec[] {
  const scores = new Map<NutrientKey, number>();
  const reasons = new Map<NutrientKey, Set<string>>();

  const add = (key: NutrientKey, weight: number, reason: string) => {
    scores.set(key, (scores.get(key) ?? 0) + weight);
    if (!reasons.has(key)) reasons.set(key, new Set());
    if (weight > 0) reasons.get(key)!.add(reason);
  };

  // Questionnaire signals
  for (const q of QUESTIONS) {
    const chosen = answers.responses[q.id];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.value === chosen);
    if (!opt?.signals) continue;
    for (const [k, w] of Object.entries(opt.signals)) {
      add(k as NutrientKey, w as number, q.reason);
    }
  }

  // Derived from basic details
  const body = computeBody(details);

  if (details.sex === "female") {
    add("iron", 1, "Women's everyday needs");
    add("folate", 1, "Women's everyday needs");
    add("calcium", 1, "Women's everyday needs");
  }

  if (details.age >= 50) {
    add("vitamin_d", 2, "Age 50+");
    add("calcium", 1, "Age 50+");
    add("vitamin_b12", 1, "Age 50+");
    add("omega_3", 1, "Age 50+");
    add("coq10", 1, "Age 50+");
  }

  if (body.bmiCategory === "Underweight") {
    add("protein", 2, "Building toward a healthy weight");
    add("multivitamin", 1, "Building toward a healthy weight");
  }
  if (body.bmiCategory === "Overweight" || body.bmiCategory === "Higher range") {
    add("fiber", 2, "Supporting satiety & routine");
    add("protein", 1, "Supporting satiety & routine");
  }

  // Focus goals nudge nutrients that map to them
  for (const slug of answers.focus) {
    for (const info of Object.values(NUTRIENTS)) {
      if (info.goalSlug === slug) add(info.key, 1, "You chose this focus area");
    }
  }

  // Everyone gets a gentle multivitamin baseline so there is always a base rec
  add("multivitamin", 0.5, "Everyday nutritional base");

  const recs: NutrientRec[] = [];
  for (const [key, score] of scores) {
    const info = NUTRIENTS[key];
    recs.push({
      ...info,
      score: round1(score),
      reasons: Array.from(reasons.get(key) ?? []),
    });
  }

  recs.sort(
    (a, b) => b.score - a.score || b.priority - a.priority || a.name.localeCompare(b.name)
  );

  // Keep the meaningful ones (score >= 1), always at least 3, at most 6.
  const strong = recs.filter((r) => r.score >= 1);
  const top = (strong.length >= 3 ? strong : recs).slice(0, 6);
  return top;
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

export interface ScanReport {
  body: BodyMetrics & {
    age: number;
    sex: Sex;
    heightCm: number;
    weightKg: number;
    activity: ActivityLevel;
  };
  targets: { hydrationLitres: number; proteinGrams: number };
  nutrients: NutrientRec[];
  goals: string[];
  summary: string[];
  flags: { consultProfessional: boolean; underweight: boolean; higherBmi: boolean };
  disclaimer: string;
}

const DISCLAIMER =
  "This Wellness Scan offers general nutritional-support suggestions based on the information you provided. It is not medical advice and does not diagnose, treat, cure or prevent any disease. Nutraceuticals and dietary supplements are not a substitute for a balanced diet or professional care. Please consult a qualified healthcare professional before starting any supplement, especially if you are pregnant, breastfeeding, have a medical condition, or take medication.";

export function buildReport(details: BasicDetails, answers: ScanAnswers): ScanReport {
  const body = computeBody(details);
  const nutrients = scoreNutrients(details, answers);

  const goals = Array.from(
    new Set<string>([...answers.focus, ...nutrients.map((n) => n.goalSlug)])
  );

  const proteinPerKg =
    details.activity === "active" || details.activity === "very_active"
      ? 1.4
      : details.activity === "moderate"
      ? 1.1
      : 0.9;
  const targets = {
    hydrationLitres: round1(Math.max(1.8, Math.min(4, details.weightKg * 0.033))),
    proteinGrams: Math.round(details.weightKg * proteinPerKg),
  };

  const summary: string[] = [];
  summary.push(
    `Your BMI is ${body.bmi} (${body.bmiCategory.toLowerCase()}). Your body uses roughly ${body.tdee.toLocaleString(
      "en-IN"
    )} kcal on a ${labelActivity(details.activity)} day.`
  );
  if (nutrients.length) {
    summary.push(
      `Based on your answers, we've highlighted ${nutrients.length} area${
        nutrients.length === 1 ? "" : "s"
      } where the right nutrients could support how you feel day to day.`
    );
  }
  summary.push(
    `A good foundation: aim for about ${targets.hydrationLitres} L of water and ~${targets.proteinGrams} g of protein a day, alongside a colourful, whole-food plate.`
  );

  const flags = {
    consultProfessional: Boolean(details.pregnant || details.medical),
    underweight: body.bmiCategory === "Underweight",
    higherBmi: body.bmiCategory === "Higher range",
  };

  return {
    body: {
      ...body,
      age: details.age,
      sex: details.sex,
      heightCm: details.heightCm,
      weightKg: details.weightKg,
      activity: details.activity,
    },
    targets,
    nutrients,
    goals,
    summary,
    flags,
    disclaimer: DISCLAIMER,
  };
}

function labelActivity(a: ActivityLevel): string {
  return (
    {
      sedentary: "sedentary",
      light: "lightly active",
      moderate: "moderately active",
      active: "very active",
      very_active: "highly active",
    } as Record<ActivityLevel, string>
  )[a];
}
