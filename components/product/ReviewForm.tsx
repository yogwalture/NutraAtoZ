"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Check, Loader2, AlertCircle } from "lucide-react";
import { submitReview } from "@/app/product/[id]/actions";

export default function ReviewForm({
  productId,
  alreadyReviewed = false,
}: {
  productId: string;
  alreadyReviewed?: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const [done, setDone] = React.useState(false);
  const [open, setOpen] = React.useState(!alreadyReviewed);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    startTransition(async () => {
      const res = await submitReview(productId, rating, title, body);
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-coral/15 bg-coral/5 px-4 py-3 text-sm font-medium text-coral-700">
        <Check className="h-4 w-4" />
        Thanks! Your review has been published.
      </div>
    );
  }

  if (alreadyReviewed && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-coral/25 bg-white px-5 py-2.5 text-sm font-bold text-coral-700 transition-colors hover:bg-coral/5"
      >
        Edit your review
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-coral/15 bg-white p-5 shadow-card"
    >
      <p className="text-sm font-bold text-ink">
        {alreadyReviewed ? "Update your review" : "Write a review"}
      </p>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                (hover || rating) >= n
                  ? "fill-accent text-accent"
                  : "text-mist/40"
              }`}
            />
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder="Add a title (optional)"
        className="mt-4 w-full rounded-xl border border-coral/20 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="Share your experience with this product…"
        className="mt-3 w-full rounded-xl border border-coral/20 bg-white p-3 text-sm text-ink outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
      />

      {error && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="shine mt-4 inline-flex items-center gap-2 rounded-full bg-citrus-gradient px-6 py-3 text-sm font-bold text-white shadow-glow-coral transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </button>
    </form>
  );
}
