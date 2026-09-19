"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HeartPulse,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  ShieldCheck,
  FlaskConical,
  Droplets,
  Beef,
  Flame,
  RotateCcw,
  Info,
  Salad,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { track } from "@/lib/track";
import { GOALS, getGoal } from "@/lib/goals";
import {
  QUESTIONS,
  ACTIVITY_OPTIONS,
  computeBody,
  type BasicDetails,
  type Sex,
  type ActivityLevel,
} from "@/lib/wellness";
import { runWellnessScan, type RunScanResult } from "@/app/wellness-scan/actions";

type Phase = "intro" | "basics" | "account" | "questions" | "loading" | "report";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Prefer not to say" },
];

const STORAGE_KEY = "naz_wellness_draft";

export default function WellnessScan() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [authed, setAuthed] = React.useState<boolean | null>(null);

  // Basic details
  const [sex, setSex] = React.useState<Sex | "">("");
  const [age, setAge] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [activity, setActivity] = React.useState<ActivityLevel | "">("");
  const [pregnant, setPregnant] = React.useState(false);
  const [medical, setMedical] = React.useState(false);

  // Questionnaire
  const [responses, setResponses] = React.useState<Record<string, string>>({});
  const [focus, setFocus] = React.useState<string[]>([]);

  // Result
  const [result, setResult] = React.useState<RunScanResult | null>(null);
  const [error, setError] = React.useState<string>();

  // Check auth on mount + restore any draft
  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(Boolean(data.user)));
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.sex) setSex(d.sex);
        if (d.age) setAge(d.age);
        if (d.height) setHeight(d.height);
        if (d.weight) setWeight(d.weight);
        if (d.activity) setActivity(d.activity);
        if (typeof d.pregnant === "boolean") setPregnant(d.pregnant);
        if (typeof d.medical === "boolean") setMedical(d.medical);
        if (d.responses) setResponses(d.responses);
        if (Array.isArray(d.focus)) setFocus(d.focus);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist draft
  React.useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sex, age, height, weight, activity, pregnant, medical, responses, focus })
      );
    } catch {
      /* ignore */
    }
  }, [sex, age, height, weight, activity, pregnant, medical, responses, focus]);

  const ageN = Number(age);
  const heightN = Number(height);
  const weightN = Number(weight);

  const basicsValid =
    sex !== "" &&
    activity !== "" &&
    ageN >= 14 &&
    ageN <= 100 &&
    heightN >= 80 &&
    heightN <= 250 &&
    weightN >= 25 &&
    weightN <= 300;

  const livePreview = basicsValid
    ? computeBody({
        sex: sex as Sex,
        age: ageN,
        heightCm: heightN,
        weightKg: weightN,
        activity: activity as ActivityLevel,
      })
    : null;

  const answeredCount = QUESTIONS.filter((q) => responses[q.id]).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  function detailsObject(): BasicDetails {
    return {
      sex: sex as Sex,
      age: ageN,
      heightCm: heightN,
      weightKg: weightN,
      activity: activity as ActivityLevel,
      pregnant,
      medical,
    };
  }

  function goFromBasics() {
    if (!basicsValid) return;
    setPhase(authed ? "questions" : "account");
  }

  async function submitScan() {
    setError(undefined);
    setPhase("loading");
    track("wellness_scan_complete", {
      meta: { answered: answeredCount, focus: focus.length },
    });
    try {
      const res = await runWellnessScan(detailsObject(), { responses, focus });
      if (res.needAuth) {
        setAuthed(false);
        setPhase("account");
        setError("Please create your account to see your report.");
        return;
      }
      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Please try again.");
        setPhase("questions");
        return;
      }
      setResult(res);
      setPhase("report");
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
      setPhase("questions");
    }
  }

  function reset() {
    setResult(null);
    setResponses({});
    setFocus([]);
    setPhase("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ============================ INTRO ============================ */
  if (phase === "intro") {
    return (
      <Shell>
        <div className="text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-coral/20 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-berry shadow-card">
            <Sparkles className="h-4 w-4" />
            Free · 2 minutes
          </span>
          <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your personal Wellness Scan
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-mist sm:text-base">
            Not sure which supplements you actually need? Answer a few quick
            questions about your body and lifestyle. We&apos;ll estimate your key
            metrics, highlight where your nutrition may fall short, and suggest
            verified products to help fill the gaps.
          </p>

          <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              [Activity, "Your metrics", "BMI, calories & targets"],
              [HeartPulse, "Smart questionnaire", "Diet, sleep, energy & more"],
              [FlaskConical, "Matched products", "From FSSAI-verified vendors"],
            ].map(([Icon, t, s]) => {
              const I = Icon as typeof Activity;
              return (
                <div key={t as string} className="rounded-2xl border border-coral/12 bg-white p-4 text-center shadow-card">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-citrus-gradient text-white">
                    <I className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-sm font-bold text-ink">{t as string}</p>
                  <p className="text-xs text-mist">{s as string}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              track("wellness_scan_start", {});
              setPhase("basics");
            }}
            className="shine mt-8 inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-8 py-4 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
          >
            Start my scan
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-6 flex items-start gap-2 rounded-2xl bg-white/70 px-4 py-3 text-left text-[11px] leading-relaxed text-mist">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This is general wellness guidance, not medical advice. It doesn&apos;t
            diagnose or treat any condition. Always consult a qualified
            healthcare professional before starting supplements.
          </p>
        </div>
      </Shell>
    );
  }

  /* ============================ BASICS ============================ */
  if (phase === "basics") {
    return (
      <Shell>
        <StepHeader step={1} total={3} title="A little about you" sub="We use these to estimate your body metrics." />

        <div className="mt-6 space-y-5">
          <div>
            <Label>Sex</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SEX_OPTIONS.map((o) => (
                <Chip key={o.value} on={sex === o.value} onClick={() => setSex(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Age (years)">
              <Input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 32" />
            </Field>
            <Field label="Height (cm)">
              <Input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 170" />
            </Field>
            <Field label="Weight (kg)">
              <Input inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 68" />
            </Field>
          </div>

          <div>
            <Label>Activity level</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ACTIVITY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setActivity(o.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    activity === o.value
                      ? "border-coral-500 bg-coral/5"
                      : "border-coral/15 bg-white hover:bg-coral/5"
                  }`}
                >
                  <p className="text-sm font-bold text-ink">{o.label}</p>
                  <p className="text-xs text-mist">{o.help}</p>
                </button>
              ))}
            </div>
          </div>

          {sex === "female" && (
            <label className="flex items-start gap-2.5 rounded-2xl border border-coral/15 bg-white px-4 py-3 text-sm text-ink">
              <input type="checkbox" checked={pregnant} onChange={(e) => setPregnant(e.target.checked)} className="mt-0.5 h-4 w-4 accent-coral-600" />
              I&apos;m pregnant or breastfeeding
            </label>
          )}
          <label className="flex items-start gap-2.5 rounded-2xl border border-coral/15 bg-white px-4 py-3 text-sm text-ink">
            <input type="checkbox" checked={medical} onChange={(e) => setMedical(e.target.checked)} className="mt-0.5 h-4 w-4 accent-coral-600" />
            I have a medical condition or take regular medication
          </label>

          {livePreview && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-citrus-soft px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-berry">Live preview</span>
              <Metric label="BMI" value={`${livePreview.bmi}`} sub={livePreview.bmiCategory} />
              <Metric label="Est. daily energy" value={`${livePreview.tdee.toLocaleString("en-IN")} kcal`} />
            </div>
          )}
        </div>

        <NavRow
          onBack={() => setPhase("intro")}
          nextLabel={authed ? "Continue" : "Continue"}
          nextDisabled={!basicsValid}
          onNext={goFromBasics}
        />
      </Shell>
    );
  }

  /* ============================ ACCOUNT ============================ */
  if (phase === "account") {
    return (
      <Shell>
        <StepHeader step={2} total={3} title="Create your free account" sub="Your report is saved to your account so you can revisit it anytime." />
        <AccountGate
          error={error}
          onAuthed={() => {
            setAuthed(true);
            setError(undefined);
            setPhase("questions");
          }}
        />
        <div className="mt-6">
          <button onClick={() => setPhase("basics")} className="inline-flex items-center gap-1.5 text-sm font-bold text-mist hover:text-coral-600">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </Shell>
    );
  }

  /* ============================ QUESTIONS ============================ */
  if (phase === "questions") {
    return (
      <Shell>
        <StepHeader step={3} total={3} title="Your lifestyle & wellness" sub="Answer all that apply — there are no wrong answers." />

        <div className="mt-6 space-y-5">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="rounded-2xl border border-coral/12 bg-white p-4 shadow-card sm:p-5">
              <p className="text-sm font-bold text-ink">{q.prompt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.options.map((o) => (
                  <Chip
                    key={o.value}
                    on={responses[q.id] === o.value}
                    onClick={() => setResponses((r) => ({ ...r, [q.id]: o.value }))}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-coral/12 bg-white p-4 shadow-card sm:p-5">
            <p className="text-sm font-bold text-ink">Anything you especially want to focus on? <span className="font-normal text-mist">(optional)</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip
                  key={g.slug}
                  on={focus.includes(g.slug)}
                  onClick={() =>
                    setFocus((f) => (f.includes(g.slug) ? f.filter((s) => s !== g.slug) : [...f, g.slug]))
                  }
                >
                  {g.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <NavRow
          onBack={() => setPhase(authed ? "basics" : "account")}
          nextLabel={allAnswered ? "Generate my report" : `${answeredCount}/${QUESTIONS.length} answered`}
          nextDisabled={!allAnswered}
          onNext={submitScan}
          nextIcon={<Sparkles className="h-4 w-4" />}
        />
      </Shell>
    );
  }

  /* ============================ LOADING ============================ */
  if (phase === "loading") {
    return (
      <Shell>
        <div className="grid place-items-center py-16 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-coral-600" />
          <p className="mt-4 font-serif text-xl font-semibold text-ink">Building your wellness report…</p>
          <p className="mt-1 text-sm text-mist">Crunching your metrics and matching verified products.</p>
        </div>
      </Shell>
    );
  }

  /* ============================ REPORT ============================ */
  const report = result?.report;
  const products = result?.products ?? [];
  if (phase === "report" && report) {
    return (
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-berry">Your Wellness Report</p>
              <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink">Here&apos;s your snapshot</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-bold text-emerald">
              <CheckCircle2 className="h-4 w-4" />
              Saved to your account
            </span>
          </div>

          {report.flags.consultProfessional && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-ink">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Because you told us you&apos;re pregnant/breastfeeding or manage a
                medical condition, please <strong>speak with your doctor</strong>{" "}
                before starting any supplement. Treat the suggestions below as
                conversation starters only.
              </span>
            </div>
          )}

          {/* Metrics */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Activity} label="BMI" value={`${report.body.bmi}`} sub={report.body.bmiCategory} />
            <MetricCard icon={Flame} label="Daily energy (TDEE)" value={report.body.tdee.toLocaleString("en-IN")} sub="kcal / day" />
            <MetricCard icon={Droplets} label="Hydration target" value={`${report.targets.hydrationLitres} L`} sub="per day" />
            <MetricCard icon={Beef} label="Protein target" value={`${report.targets.proteinGrams} g`} sub="per day" />
          </div>

          {/* Summary */}
          <div className="mt-6 space-y-2">
            {report.summary.map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink/80">{line}</p>
            ))}
          </div>
        </div>

        {/* Nutrient focus */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Nutrients to focus on</h2>
          <p className="mt-1 text-sm text-mist">Based on your answers, these could support how you feel day to day. Food first — supplements help fill the gaps.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {report.nutrients.map((n) => {
              const goal = getGoal(n.goalSlug);
              return (
                <div key={n.key} className="rounded-2xl border border-coral/12 bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-ink">{n.name}</p>
                    {goal && (
                      <a href={`/goals/${goal.slug}`} className="shrink-0 rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral-700 hover:bg-coral/20">
                        Shop {goal.label}
                      </a>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-ink/75">{n.why}</p>
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-mist">
                    <Salad className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                    <span><span className="font-semibold text-ink/70">Food sources:</span> {n.foods}</span>
                  </p>
                  {n.reasons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {n.reasons.slice(0, 3).map((r) => (
                        <span key={r} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-coral-700">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended products */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Recommended for you</h2>
          <p className="mt-1 text-sm text-mist">Verified products from FSSAI-registered vendors that match your focus nutrients.</p>

          {products.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-coral/15 bg-white px-6 py-12 text-center shadow-card">
              <p className="text-sm text-mist">We&apos;re still onboarding vendors for some of your nutrients. Meanwhile, browse by your recommended goals.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {report.goals.slice(0, 4).map((slug) => {
                  const g = getGoal(slug);
                  if (!g) return null;
                  return (
                    <a key={slug} href={`/goals/${slug}`} className="rounded-full bg-citrus-gradient px-4 py-2 text-sm font-bold text-white shadow-glow-coral">{g.label}</a>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map(({ product, reasons }) => (
                <article key={product.id} className="group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card">
                  <a href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25 text-coral-600">
                    <span className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
                      <FlaskConical className="h-14 w-14" strokeWidth={1.1} />
                    </span>
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-coral-600 shadow-float backdrop-blur">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                    {product.discount && (
                      <span className="absolute left-3 top-3 rounded-full bg-citrus-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow-berry">{product.discount}</span>
                    )}
                  </a>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-berry">{product.brand}</p>
                    <a href={`/product/${product.id}`} className="mt-1 text-sm font-bold leading-snug text-ink transition-colors hover:text-coral-700">{product.title}</a>
                    {reasons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {reasons.slice(0, 2).map((r) => (
                          <span key={r} className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-medium text-coral-700">{r}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-serif text-lg font-semibold text-ink">₹{product.price.toLocaleString("en-IN")}</span>
                        {product.discount && <span className="text-xs text-mist line-through">₹{product.mrp.toLocaleString("en-IN")}</span>}
                      </span>
                      <AddToCartButton id={product.id} title={product.title} price={product.price} brand={product.brand} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full border border-coral/25 bg-white px-5 py-2.5 text-sm font-bold text-coral-700 hover:bg-coral/5">
            <RotateCcw className="h-4 w-4" />
            Retake scan
          </button>
          <a href="/account" className="inline-flex items-center gap-1.5 rounded-full bg-citrus-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow-coral">
            Go to my account
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="rounded-2xl bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-mist">{report.disclaimer}</p>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8">
      {children}
    </div>
  );
}

function StepHeader({ step, total, title, sub }: { step: number; total: number; title: string; sub: string }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-citrus-gradient" : "bg-secondary"}`} />
        ))}
      </div>
      <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-mist">{sub}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        on ? "border-coral-500 bg-citrus-gradient text-white shadow-glow-coral" : "border-coral/20 bg-white text-ink/70 hover:bg-coral/5"
      }`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-xs text-mist">{label}:</span>
      <span className="font-serif text-lg font-semibold text-ink">{value}</span>
      {sub && <span className="text-xs text-mist">{sub}</span>}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: typeof Activity; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-coral/12 bg-citrus-soft p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-coral-600 shadow-card">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2.5 text-xs font-semibold uppercase tracking-wide text-mist">{label}</p>
      <p className="font-serif text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-mist">{sub}</p>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel, nextDisabled, nextIcon }: { onBack: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean; nextIcon?: React.ReactNode }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-mist transition-colors hover:text-coral-600">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-7 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel}
        {nextIcon ?? <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline account gate                                                 */
/* ------------------------------------------------------------------ */

function AccountGate({ onAuthed, error }: { onAuthed: () => void; error?: string }) {
  const [mode, setMode] = React.useState<"signup" | "signin">("signup");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string>();
  const [notice, setNotice] = React.useState<string>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(undefined);
    setNotice(undefined);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setLocalError(err.message);
        setLoading(false);
        return;
      }
      onAuthed();
      return;
    }

    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (err) {
      setLocalError(err.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      onAuthed();
      return;
    }
    setLoading(false);
    setNotice("Account created! Please check your email to confirm, then sign in here — your answers are saved.");
    setMode("signin");
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setLocalError(undefined);
              setNotice(undefined);
            }}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === m ? "bg-white text-coral-700 shadow-card" : "text-mist hover:text-coral-600"
            }`}
          >
            {m === "signup" ? "Create account" : "I have an account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="wname">Full name</Label>
            <Input id="wname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="wemail">Email</Label>
          <Input id="wemail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wpass">Password</Label>
          <Input id="wpass" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {(localError || error) && (
          <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {localError || error}
          </p>
        )}
        {notice && (
          <p className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-coral-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait…
            </>
          ) : mode === "signup" ? (
            <>
              <UserPlus className="h-4 w-4" />
              Create account & continue
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in & continue
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
