"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { requestAccountDeletion } from "@/app/account/actions";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function confirmDelete() {
    setError(undefined);
    startTransition(async () => {
      const res = await requestAccountDeletion();
      if (!res.ok) {
        setError(res.error ?? "Could not delete your account.");
        return;
      }
      // Ensure the browser session is cleared, then leave.
      try {
        await createSupabaseBrowserClient().auth.signOut();
      } catch {
        /* ignore */
      }
      router.push("/?deleted=1");
      router.refresh();
    });
  }

  return (
    <div className="mt-10 rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-destructive">
        <ShieldAlert className="h-4 w-4" />
        Delete my account &amp; data
      </h2>
      <p className="mt-1 max-w-prose text-xs text-mist">
        Permanently deletes your login and wellness data, and anonymizes your
        order history. This can&apos;t be undone.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete my account
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-foreground">
            Are you sure? This permanently removes your data.
          </p>
          {error && (
            <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={confirmDelete}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Yes, delete everything
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-lg px-3 py-2 text-xs font-medium text-mist hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
