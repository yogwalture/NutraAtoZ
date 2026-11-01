"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { deleteCustomerAccount } from "@/lib/privacy";

export interface AccountActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Self-serve "delete my account & data". Removes the signed-in user's profile,
 * wellness data and login, and anonymizes their order history. Irreversible.
 */
export async function requestAccountDeletion(): Promise<AccountActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're not signed in." };

  const res = await deleteCustomerAccount(
    user.id,
    user.email ?? null,
    "self-serve"
  );
  if (!res.ok) return { ok: false, error: res.error };

  // Clear the local session cookie too.
  await supabase.auth.signOut().catch(() => {});
  return { ok: true };
}
