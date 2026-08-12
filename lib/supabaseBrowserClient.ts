import { createBrowserClient } from "@supabase/ssr";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-placeholder";

/** Browser Supabase client for the admin login form (sign in / sign out). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(url, anon);
}
