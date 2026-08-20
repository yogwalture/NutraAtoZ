"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Product search box that routes to /search?q=… on submit. */
export default function SearchBox({
  defaultValue = "",
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist" />
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search supplements, brands, goals…"
        className="w-full rounded-full border border-coral/20 bg-white py-3.5 pl-12 pr-28 text-sm text-ink shadow-card outline-none transition focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-citrus-gradient px-5 py-2 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-[calc(50%+2px)]"
      >
        Search
      </button>
    </form>
  );
}
