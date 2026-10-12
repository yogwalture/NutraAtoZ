import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic";

/**
 * OAuth / PKCE email-confirmation landing.
 *
 * Supabase redirects here with `?code=...` after the user clicks the
 * confirmation link (when the email uses the default `{{ .ConfirmationURL }}`
 * / PKCE flow). We exchange the code for a session (sets the auth cookies)
 * and then forward the user to `next` (defaults to /account).
 *
 * Any Supabase-reported error, a missing code, or a failed exchange sends the
 * user to /login with a readable message instead of a blank page.
 */
function safeNext(next: string | null): string {
  // Only allow same-site relative paths to avoid open redirects.
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const authError =
    searchParams.get("error_description") || searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(authError)}`
    );
  }

  if (code) {
    // Reaching here means Supabase already verified the one-time token and
    // confirmed the email before redirecting with a code. Exchanging it
    // establishes the session for same-device sign-ups. If the exchange fails
    // (most commonly because the email was opened on a different device, so
    // the PKCE code-verifier isn't in this browser), the account is still
    // confirmed — so we send the user to sign in rather than show an error.
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?verified=1`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "This confirmation link is missing its code. Please sign in, or request a new link."
    )}`
  );
}
