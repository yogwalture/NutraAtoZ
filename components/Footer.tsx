import Logo from "./Logo";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-emerald/10 bg-alabaster">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-mist">
              A premium marketplace for lab-tested nutraceuticals. Every vendor
              FSSAI-verified, every batch independently tested.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              ["Shop", ["Categories", "Lab-Tested", "New Arrivals", "Bestsellers"]],
              ["Company", ["About", "Vendors", "Careers", "Contact"]],
              ["Support", ["FAQ", "Shipping", "Returns", "Lab Reports"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-ink">
                  {title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {(links as string[]).map((l) => (
                    <li key={l}>
                      <a
                        href={l === "Vendors" ? "/vendor/onboarding" : "#"}
                        className="text-sm text-mist transition-colors hover:text-emerald"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-emerald/10 pt-6 text-xs text-mist sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Nutraatoz. All rights reserved.</p>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald" />
            FSSAI-compliant · Secure payments via Razorpay
          </span>
        </div>
      </div>
    </footer>
  );
}
