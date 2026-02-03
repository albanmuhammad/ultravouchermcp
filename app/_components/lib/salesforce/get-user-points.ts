import { createSupabaseServerClient } from "../supabase/server";
import { getSalesforceMemberProfile } from "../salesforce/get-member-profile";

export async function getUserPoints(): Promise<number | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("salesforce_loyalty_member_id")
    .eq("id", user.id)
    .single();

  if (!profile?.salesforce_loyalty_member_id) {
    return null;
  }

  const member = await getSalesforceMemberProfile(
    profile.salesforce_loyalty_member_id,
  );

  const currency = member.memberCurrencies[0];
  if (!currency) return null;

  return currency.pointsBalance;
}
