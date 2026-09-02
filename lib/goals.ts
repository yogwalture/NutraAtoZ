/**
 * Canonical wellness goals for need-based discovery.
 *
 * Compliance note: goals describe everyday wellness *support*, never the
 * diagnosis, treatment, cure or prevention of disease. Copy is deliberately
 * phrased around lifestyle support, and every goal page carries the standard
 * supplement disclaimer.
 *
 * `keywords` power a best-effort fallback so existing catalogue items surface
 * on the right goal pages even before a vendor explicitly tags them. Explicit
 * tags (products.goals) always take priority.
 */
export interface WellnessGoal {
  slug: string;
  label: string;
  /** Short, benefit-led (but non-medical) blurb. */
  blurb: string;
  /** lucide-react icon name. */
  icon: string;
  /** Tailwind gradient classes for the goal tile/panel. */
  gradient: string;
  /** Lower-cased match terms for the keyword fallback. */
  keywords: string[];
}

export const GOALS: WellnessGoal[] = [
  {
    slug: "sleep-calm",
    label: "Sleep & Calm",
    blurb: "Wind-down support for restful nights and everyday calm.",
    icon: "Moon",
    gradient: "from-berry-500/25 via-white to-coral-500/20",
    keywords: [
      "sleep",
      "calm",
      "relax",
      "melatonin",
      "magnesium",
      "ashwagandha",
      "l-theanine",
      "theanine",
      "chamomile",
      "valerian",
      "gaba",
    ],
  },
  {
    slug: "stress-mood",
    label: "Stress & Mood",
    blurb: "Adaptogens and nutrients to help you handle daily stress.",
    icon: "Brain",
    gradient: "from-coral-500/25 via-white to-amber-500/20",
    keywords: [
      "stress",
      "mood",
      "adaptogen",
      "ashwagandha",
      "rhodiola",
      "brahmi",
      "bacopa",
      "cortisol",
      "focus",
      "l-theanine",
    ],
  },
  {
    slug: "energy-vitality",
    label: "Energy & Vitality",
    blurb: "Everyday energy support to help you feel less run-down.",
    icon: "Zap",
    gradient: "from-amber-500/25 via-white to-coral-500/20",
    keywords: [
      "energy",
      "vitality",
      "b12",
      "b-complex",
      "iron",
      "coq10",
      "ubiquinol",
      "ginseng",
      "fatigue",
      "metabolism",
    ],
  },
  {
    slug: "immunity",
    label: "Immunity",
    blurb: "Nutrients that support your body's everyday defenses.",
    icon: "ShieldPlus",
    gradient: "from-coral-500/25 via-white to-berry-500/20",
    keywords: [
      "immunity",
      "immune",
      "vitamin c",
      "vitamin d",
      "zinc",
      "elderberry",
      "amla",
      "giloy",
      "antioxidant",
    ],
  },
  {
    slug: "gut-digestion",
    label: "Gut & Digestion",
    blurb: "Probiotics, fibre and enzymes for digestive comfort.",
    icon: "Sprout",
    gradient: "from-amber-500/25 via-white to-berry-500/20",
    keywords: [
      "gut",
      "digest",
      "probiotic",
      "prebiotic",
      "fibre",
      "fiber",
      "enzyme",
      "bloat",
      "psyllium",
      "isabgol",
    ],
  },
  {
    slug: "bones-joints",
    label: "Bones & Joints",
    blurb: "Support for joint comfort, mobility and bone strength.",
    icon: "Bone",
    gradient: "from-berry-500/25 via-white to-amber-500/20",
    keywords: [
      "joint",
      "bone",
      "calcium",
      "vitamin d",
      "collagen",
      "glucosamine",
      "chondroitin",
      "msm",
      "mobility",
      "cartilage",
    ],
  },
  {
    slug: "heart-health",
    label: "Heart Health",
    blurb: "Omega-3s and nutrients for everyday cardiovascular support.",
    icon: "HeartPulse",
    gradient: "from-coral-500/25 via-white to-berry-500/20",
    keywords: [
      "heart",
      "cardio",
      "omega",
      "epa",
      "dha",
      "fish oil",
      "flax",
      "coq10",
      "cholesterol",
    ],
  },
  {
    slug: "skin-hair-nails",
    label: "Skin, Hair & Nails",
    blurb: "Beauty-from-within support with collagen and key vitamins.",
    icon: "Sparkles",
    gradient: "from-berry-500/25 via-white to-coral-500/20",
    keywords: [
      "skin",
      "hair",
      "nail",
      "collagen",
      "biotin",
      "keratin",
      "glutathione",
      "hyaluronic",
      "beauty",
    ],
  },
  {
    slug: "fitness-recovery",
    label: "Fitness & Recovery",
    blurb: "Protein, creatine and aminos to support training and recovery.",
    icon: "Dumbbell",
    gradient: "from-amber-500/25 via-white to-coral-500/20",
    keywords: [
      "protein",
      "whey",
      "creatine",
      "bcaa",
      "amino",
      "pre-workout",
      "preworkout",
      "recovery",
      "muscle",
      "eaa",
      "isolate",
    ],
  },
  {
    slug: "womens-health",
    label: "Women's Health",
    blurb: "Targeted support across different stages of a woman's life.",
    icon: "Flower2",
    gradient: "from-berry-500/25 via-white to-amber-500/20",
    keywords: [
      "women",
      "woman",
      "prenatal",
      "folate",
      "folic",
      "iron",
      "pcos",
      "menopause",
      "hormone",
    ],
  },
  {
    slug: "mens-health",
    label: "Men's Health",
    blurb: "Everyday nutrients tailored to men's wellness needs.",
    icon: "User",
    gradient: "from-coral-500/25 via-white to-amber-500/20",
    keywords: [
      "men",
      "man",
      "testosterone",
      "prostate",
      "fertility",
      "shilajit",
      "performance",
      "vitality",
    ],
  },
  {
    slug: "daily-essentials",
    label: "Daily Essentials",
    blurb: "Multivitamins and everyday staples to fill dietary gaps.",
    icon: "CircleCheck",
    gradient: "from-amber-500/25 via-white to-berry-500/20",
    keywords: [
      "multivitamin",
      "multi-vitamin",
      "daily",
      "essential",
      "omega",
      "vitamin",
      "mineral",
      "wellness",
    ],
  },
];

export function getGoal(slug: string): WellnessGoal | undefined {
  return GOALS.find((g) => g.slug === slug);
}

/** True if a product's text/attributes match a goal's keyword set. */
export function textMatchesGoal(haystack: string, goal: WellnessGoal): boolean {
  const h = haystack.toLowerCase();
  return goal.keywords.some((k) => h.includes(k));
}
