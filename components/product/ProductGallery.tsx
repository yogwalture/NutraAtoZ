"use client";

import * as React from "react";
import { FlaskConical, ShieldCheck } from "lucide-react";

export default function ProductGallery({
  images,
  title,
  discount,
}: {
  images: string[];
  title: string;
  discount?: string | null;
}) {
  const gallery = images.filter(Boolean);
  const [active, setActive] = React.useState(0);
  const current = gallery[active] ?? gallery[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-coral-500/25 via-white to-berry-500/25">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-coral-600">
            <FlaskConical className="h-28 w-28" strokeWidth={1} />
          </div>
        )}
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-coral-600 shadow-float backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified vendor
        </span>
        {discount && (
          <span className="absolute left-4 top-4 rounded-full bg-citrus-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-glow-berry">
            {discount}
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors ${
                i === active
                  ? "border-coral-500"
                  : "border-white/70 hover:border-coral-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
