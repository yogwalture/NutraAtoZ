import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic";

/**
 * Email-confirmation landing for the `token_hash` flow.
 *
 * This is the cross-device-safe verification path: unlike the PKCE `?code`
 * flow, `verifyOtp({ token_hash })` does NOT need the code-verifier that was
 * stored in the signing-up browser, so the link works even when the user
 * opens their email on a different device.
 *
 * On success we forward to `next` (defaults to /account); on any failure we
 * send the user to /login with a readable message instead of a blank page.
 *
 * IMPORTANT: behind the Coolify/Traefik reverse proxy the request's own
 * origin is the container-internal `localhost:3000`, so we build the public
 * base URL from the forwarded headers.
 */
type EmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

const ALLOWED_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function getBaseUrl(request: NextRequest, fallbackOrigin: string): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : fallbackOrigin;
}

function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const base = getBaseUrl(request, origin);
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const next = safeNext(searchParams.get("next"));

  const type =
    typeParam && (ALLOWED_TYPES as readonly string[]).includes(typeParam)
      ? (typeParam as EmailOtpType)
      : null;

  if (tokenHash && type) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${base}/login?error=${encodeURIComponent(
      "This confirmation link is invalid or has expired. Please sign in, or request a new link."
    )}`
  );
}
