import {
  Sparkles,
  ArrowRight,
  Activity,
  HeartPulse,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

/**
 * Homepage entry point for the Wellness Scan. A prominent, on-brand band that
 * invites first-time / unsure customers to get a personalized nutrient report.
 */
export default function WellnessScanBand() {
  return (
    <section id="wellness-scan" className="relative overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-[#0F4C43] via-[#12564C] to-[#0C3F38] p-8 shadow-float sm:p-12">
          <div className="orb orb-amber right-[-4rem] top-[-4rem] h-64 w-64 opacity-30" />
          <div className="orb orb-coral bottom-[-6rem] left-[-3rem] h-64 w-64 opacity-30" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                New · AI-guided
              </span>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.9rem]">
                Not sure what your body needs?
                <br className="hidden sm:block" /> Take the{" "}
                <span className="text-amber-300">Wellness Scan</span>.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                Answer a few quick questions about your body and lifestyle. In
                two minutes you&apos;ll get your key metrics, a personalized
                nutrient report, and verified products matched to exactly what
                you may be missing — no guesswork.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="/wellness-scan"
                  className="shine inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-8 py-4 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
                >
                  Start my free scan
                  <ArrowRight className="h-4 w-4" />
                </a>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  Free · Private · 2 minutes
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [Activity, "Your metrics", "BMI, calories & daily targets"],
                [HeartPulse, "Nutrient report", "Where your diet may fall short"],
                [FlaskConical, "Matched products", "From FSSAI-verified vendors"],
              ].map(([Icon, t, s]) => {
                const I = Icon as typeof Activity;
                return (
                  <div
                    key={t as string}
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-amber-200">
                      <I className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{t as string}</p>
                      <p className="text-xs text-white/60">{s as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
