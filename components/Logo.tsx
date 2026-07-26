import { Leaf } from "lucide-react";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className="group flex items-center gap-2.5" aria-label="Nutraatoz home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald text-alabaster shadow-card transition-transform group-hover:scale-105">
        <Leaf className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-lg font-semibold tracking-tight text-emerald">
            Nutra<span className="text-gold">atoz</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-mist">
            Lab-Tested Wellness
          </span>
        </span>
      )}
    </a>
  );
}
