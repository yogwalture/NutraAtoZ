"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5"
    >
      <Printer className="h-4 w-4" />
      Download / print PDF
    </button>
  );
}
