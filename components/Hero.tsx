import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-grain">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald/15 bg-emerald/5 px-3.5 py-1.5 text-xs font-medium text-emerald">
              <ShieldCheck className="h-4 w-4" />
              FSSAI-verified vendors · Third-party lab reports
            </span>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-emerald sm:text-5xl lg:text-6xl">
              Wellness you can{" "}
              <span className="text-gold">trust</span>, sourced with care.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">
              A curated marketplace of premium nutraceuticals — every supplement
              lab-tested, every vendor verified. Discover the cleanest path to
              your wellness goals.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-alabaster shadow-card transition-all hover:bg-emerald-700 hover:shadow-card-hover">
                Shop Supplements
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-emerald/20 px-7 py-3.5 text-sm font-semibold text-emerald transition-colors hover:bg-emerald/5">
                <Sparkles className="h-4 w-4" />
                Explore Categories
              </button>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-emerald/10 pt-6">
              {[
                ["180+", "Lab-Tested SKUs"],
                ["40+", "Verified Vendors"],
                ["4.9★", "Avg. Rating"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <dt className="font-serif text-2xl font-semibold text-emerald">
                    {stat}
                  </dt>
                  <dd className="mt-0.5 text-xs text-mist">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual placeholder */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-xl2 bg-gradient-to-br from-emerald via-emerald-700 to-emerald-800 shadow-card-hover">
              <div className="absolute inset-0 bg-grain opacity-30" />
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <div>
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-alabaster/10 backdrop-blur">
                    <Sparkles className="h-10 w-10 text-gold" />
                  </div>
                  <p className="mt-5 font-serif text-2xl font-medium text-alabaster">
                    Hero Visual
                  </p>
                  <p className="mt-1 text-sm text-alabaster/60">
                    Product photography placeholder
                  </p>
                </div>
              </div>
            </div>
            {/* Floating trust chip */}
            <div className="absolute -bottom-4 -left-2 flex items-center gap-3 rounded-2xl bg-alabaster px-4 py-3 shadow-card-hover sm:-left-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald/10 text-emerald">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Certificate of Analysis</p>
                <p className="text-xs text-mist">on every product page</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
