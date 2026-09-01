import { FlaskConical, ShieldCheck, Truck, Leaf, BadgeCheck, HeartPulse } from "lucide-react";

const ITEMS = [
  { icon: FlaskConical, label: "Certificate of Analysis on request" },
  { icon: ShieldCheck, label: "FSSAI-verified vendors" },
  { icon: Truck, label: "Fast pan-India delivery" },
  { icon: Leaf, label: "No proprietary blends" },
  { icon: BadgeCheck, label: "Documented ingredients" },
  { icon: HeartPulse, label: "Goal-based formulas" },
];

export default function MarqueeBar() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="relative z-10 border-y border-white/60 bg-citrus-gradient py-3.5">
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track gap-10 pr-10">
          {loop.map((item, i) => {
            const Icon = item.icon;
            return (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2.5 text-sm font-semibold text-white/95"
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
                {item.label}
                <span className="ml-8 text-white/40">•</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
