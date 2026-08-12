import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-placeholder";

/**
 * Supabase client for Server Components / Route Handlers that reads the
 * auth session from cookies. Used only to resolve *who* is logged in —
 * privileged data reads go through `supabaseAdmin` (service role).
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore; middleware
          // refreshes the session cookie.
        }
      },
    },
  });
}
