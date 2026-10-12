import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic";

/**
 * OAuth / PKCE email-confirmation landing.
 *
 * Supabase redirects here with `?code=...` after the user clicks the
 * confirmation link. We exchange the code for a session (sets the auth
 * cookies) and then forward the user to `next` (defaults to /account).
 *
 * IMPORTANT: behind the Coolify/Traefik reverse proxy the request's own
 * origin is the container-internal `localhost:3000`, so we must build the
 * public base URL from the forwarded headers — otherwise redirects point at
 * localhost and the user hits a dead page.
 */
function getBaseUrl(request: NextRequest, fallbackOrigin: string): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : fallbackOrigin;
}

function safeNext(next: string | null): string {
  // Only allow same-site relative paths to avoid open redirects.
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const base = getBaseUrl(request, origin);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const authError =
    searchParams.get("error_description") || searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(authError)}`
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
      return NextResponse.redirect(`${base}${next}`);
    }
    return NextResponse.redirect(`${base}/login?verified=1`);
  }

  return NextResponse.redirect(
    `${base}/login?error=${encodeURIComponent(
      "This confirmation link is missing its code. Please sign in, or request a new link."
    )}`
  );
}
