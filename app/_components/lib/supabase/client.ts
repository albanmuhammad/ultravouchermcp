import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export async function updateMembershipIds({
  userId,
  ultraVoucherId,
  salesforceMemberId,
}: {
  userId: string;
  ultraVoucherId?: string;
  salesforceMemberId?: string;
}) {
  const supabase = createSupabaseBrowserClient();

  return supabase
    .from("profiles")
    .insert({
      ultra_voucher_member_id: ultraVoucherId,
      salesforce_loyalty_member_id: salesforceMemberId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}
