"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Status = "verifying" | "ready" | "saving" | "done" | "invalid";

/**
 * Landing page for the agent invite email. Supabase redirects here after the
 * agent clicks the secure link; the session arrives in the URL hash. We
 * establish it, let the agent choose a password, then drop them into the portal.
 */
export default function AgentActivatePage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = React.useState<Status>("verifying");
  const [error, setError] = React.useState<string>();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function establish() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);

      const hashError =
        hash.get("error_description") ||
        hash.get("error") ||
        query.get("error_description") ||
        query.get("error");

      window.history.replaceState(null, "", window.location.pathname);

      if (hashError) {
        if (!cancelled) {
          setError(hashError);
          setStatus("invalid");
        }
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!cancelled) {
          if (sessErr) {
            setError(sessErr.message);
            setStatus("invalid");
          } else {
            setStatus("ready");
          }
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!cancelled) setStatus(data.session ? "ready" : "invalid");
    }

    establish();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setStatus("saving");
    const { error: updErr } = await supabase.auth.updateUser({ password });
    if (updErr) {
      setError(updErr.message);
      setStatus("ready");
      return;
    }
    setStatus("done");
    setTimeout(() => {
      router.push("/agent");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)] px-5">
      <div className="orb orb-coral left-[-6rem] top-[-4rem] h-72 w-72 animate-float-slow" />
      <div className="orb orb-amber bottom-[-4rem] right-[-4rem] h-64 w-64 animate-float" />
      <div className="absolute inset-0 bg-grain" />

      <div className="relative z-10 w-full max-w-sm animate-fade-up rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-float backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-citrus-gradient text-white shadow-glow-coral">
            <Headphones className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">
            Activate your agent account
          </h1>
        </div>

        {status === "verifying" && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-mist">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying your invite…
          </p>
        )}

        {status === "invalid" && (
          <div className="mt-6 space-y-4 text-center">
            <p className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error || "This invite link is invalid or has expired."}
            </p>
            <a
              href="/agent/login"
              className="inline-block text-sm font-semibold text-coral-600 hover:underline"
            >
              Go to agent sign in →
            </a>
          </div>
        )}

        {status === "done" && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-coral-700">
            <CheckCircle2 className="h-5 w-5" />
            Password set! Taking you to your dashboard…
          </p>
        )}

        {(status === "ready" || status === "saving") && (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <p className="text-center text-xs text-mist">
              Set a password to finish activating your account.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={status === "saving"}>
              {status === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Set password &amp; continue
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
