import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. Set these in `.env.local` (see `.env.example`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-placeholder-key"
);

/** Storage bucket that holds vendor FSSAI certificates. */
export const FSSAI_BUCKET = "fssai-certificates";
