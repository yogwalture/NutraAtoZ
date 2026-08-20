import Logo from "./Logo";
import { ShieldCheck, Instagram, Twitter, Facebook } from "lucide-react";

const FOOTER_LINKS: Record<string, string> = {
  Categories: "/#categories",
  "Lab-Tested": "/products",
  "New Arrivals": "/products",
  Bestsellers: "/products",
  About: "/about",
  Vendors: "/vendor/onboarding",
  Careers: "/careers",
  Contact: "/contact",
  FAQ: "/faq",
  Shipping: "/shipping",
  Returns: "/returns",
  "Lab Reports": "/lab-reports",
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/60 bg-citrus-soft">
      <div className="orb orb-berry left-[-4rem] top-[-3rem] h-52 w-52 opacity-25" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-mist">
              A vibrant marketplace for lab-tested nutraceuticals. Every vendor
              FSSAI-verified, every batch independently tested.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-coral/20 bg-white text-coral-600 shadow-card transition-all hover:-translate-y-0.5 hover:bg-citrus-gradient hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              ["Shop", ["Categories", "Lab-Tested", "New Arrivals", "Bestsellers"]],
              ["Company", ["About", "Vendors", "Careers", "Contact"]],
              ["Support", ["FAQ", "Shipping", "Returns", "Lab Reports"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink">
                  {title}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {(links as string[]).map((l) => (
                    <li key={l}>
                      <a
                        href={FOOTER_LINKS[l] ?? "#"}
                        className="text-sm text-mist transition-colors hover:text-coral-600"
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

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-coral/10 pt-6 text-xs text-mist sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Nutraatoz. All rights reserved.</p>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-coral-600" />
            FSSAI-compliant · Secure payments via Razorpay
          </span>
        </div>
      </div>
    </footer>
  );
}
