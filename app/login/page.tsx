"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, LogIn, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [notice, setNotice] = React.useState<string>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setNotice(undefined);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
      return;
    }

    // sign up
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/account");
      router.refresh();
      return;
    }
    setLoading(false);
    setNotice(
      "Account created! Please check your email to confirm, then sign in."
    );
    setMode("signin");
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)] px-5">
      <div className="orb orb-coral left-[-6rem] top-[-4rem] h-72 w-72 animate-float-slow" />
      <div className="orb orb-amber bottom-[-4rem] right-[-4rem] h-64 w-64 animate-float" />
      <div className="absolute inset-0 bg-grain" />

      <div className="relative z-10 w-full max-w-sm animate-fade-up rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-float backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="/nutraatoz-wordmark.png"
            alt="Nutraatoz"
            className="h-9 w-auto"
          />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-xs text-mist">
            {mode === "signin"
              ? "Sign in to track orders and check out faster."
              : "Join Nutraatoz to save your details and orders."}
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(undefined);
                setNotice(undefined);
              }}
              className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === m
                  ? "bg-white text-coral-700 shadow-card"
                  : "text-mist hover:text-coral-600"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {notice && (
            <p className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-coral-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {notice}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait…
              </>
            ) : mode === "signin" ? (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-mist">
          <a href="/" className="font-medium text-coral-600 hover:underline">
            ← Back to store
          </a>
        </p>
      </div>
    </div>
  );
}
