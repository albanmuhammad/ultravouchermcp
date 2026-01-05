import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type SaveUserInput = Readonly<{
  email: string;
  supabaseUserId: string;
  salesforceMemberId: string;
  salesforcePersonAccountId: string;
  ultravoucherCustomerId: string;
}>;

export async function saveRegisteredUser(input: SaveUserInput): Promise<void> {
  const { error } = await supabase.from("users").insert({
    email: input.email,
    supabase_user_id: input.supabaseUserId,
    sf_loyalty_member_id: input.salesforceMemberId,
    sf_person_account_id: input.salesforcePersonAccountId,
    uv_customer_id: input.ultravoucherCustomerId,
  });

  if (error) throw error;
}
