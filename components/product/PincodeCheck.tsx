"use client";

import * as React from "react";
import { MapPin, Truck, CheckCircle2 } from "lucide-react";

/** Lightweight delivery check. Nutraatoz ships pan-India, so any valid
 * 6-digit Indian pincode returns a delivery estimate. */
export default function PincodeCheck() {
  const [pin, setPin] = React.useState("");
  const [result, setResult] = React.useState<null | boolean>(null);

  function check(e: React.FormEvent) {
    e.preventDefault();
    setResult(/^[1-9][0-9]{5}$/.test(pin.trim()));
  }

  return (
    <div>
      <form onSubmit={check} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/[^0-9]/g, ""));
              setResult(null);
            }}
            placeholder="Enter 6-digit pincode"
            className="w-full rounded-xl border border-coral/20 bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-citrus-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
        >
          Check
        </button>
      </form>
      {result === true && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 text-coral-600" />
          Delivers to {pin} · estimated 3–7 business days
        </p>
      )}
      {result === false && (
        <p className="mt-2 text-sm text-mist">
          Please enter a valid 6-digit Indian pincode.
        </p>
      )}
      {result === null && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-mist">
          <Truck className="h-3.5 w-3.5" />
          We currently ship across India.
        </p>
      )}
    </div>
  );
}
