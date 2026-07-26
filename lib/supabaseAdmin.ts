import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for trusted server-side reads/writes.
 * NEVER import this into client components — the service key bypasses RLS.
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin = createClient(
  url || "https://placeholder.supabase.co",
  serviceKey || "service-role-placeholder",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
