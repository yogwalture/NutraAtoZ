import { Citrus } from "lucide-react";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" className="group flex items-center gap-2.5" aria-label="Nutraatoz home">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-citrus-gradient text-white shadow-glow-coral transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Citrus className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-xl font-semibold tracking-tight text-ink">
            Nutra<span className="text-gradient">atoz</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
            Lab-Tested Wellness
          </span>
        </span>
      )}
    </a>
  );
}
