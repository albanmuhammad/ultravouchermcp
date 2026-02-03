"use server";

import { debitSalesforcePoints } from "../_components/lib/salesforce/debit-points";
import { getSalesforceMemberProfile } from "../_components/lib/salesforce/get-member-profile";
import { createSupabaseServerActionClient } from "../_components/lib/supabase/server-action";
import { redeemUltraVoucher } from "../_components/lib/ultravoucher/redeem";
import { revalidatePath } from "next/cache";

export type AddToCartInput = {
  voucherId: string;
  voucherName: string;
  price: number;
  pointPrice: number;
};

export async function addToCart(input: AddToCartInput) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { error } = await supabase.from("cart_items").insert({
    user_id: user.id,
    voucher_id: input.voucherId,
    voucher_name: input.voucherName,
    price: input.price,
    point_price: input.pointPrice,
    quantity: 1,
  });

  if (error) {
    console.error(error);
    throw new Error("FAILED_ADD_TO_CART");
  }

  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    throw new Error("FAILED_REMOVE_FROM_CART");
  }

  return { success: true };
}

export async function redeemCart() {
  const supabase = await createSupabaseServerActionClient();

  /* 1️⃣ Auth */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");

  /* 2️⃣ Cart items */
  const { data: items, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id);

  if (error || !items || items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  const total = items.reduce(
    (sum, i) => sum + Number(i.point_price) * i.quantity,
    0,
  );

  console.log("total", total);

  /* 3️⃣ Profile */
  const { data: profile } = await supabase
    .from("profiles")
    .select("salesforce_loyalty_member_id")
    .eq("id", user.id)
    .single();

  if (!profile?.salesforce_loyalty_member_id) {
    throw new Error("NO_SF_MEMBER");
  }

  /* 4️⃣ Salesforce: get member profile */
  const member = await getSalesforceMemberProfile(
    profile.salesforce_loyalty_member_id,
  );

  const currency = member.memberCurrencies[0];

  if (!currency) {
    throw new Error("NO_MEMBER_CURRENCY");
  }

  const pointsBalance = currency.pointsBalance;

  if (pointsBalance < total) {
    throw new Error("INSUFFICIENT_POINTS");
  }

  /* 5️⃣ Debit Salesforce points (TOTAL SEKALI) */
  const orderId = crypto.randomUUID();

  await debitSalesforcePoints({
    memberId: profile.salesforce_loyalty_member_id,
    points: total,
    orderId,
  });

  /* 6️⃣ Redeem UltraVoucher (per item) */
  for (const item of items) {
    await redeemUltraVoucher({
      voucherId: item.voucher_id,
      quantity: item.quantity,
    });
  }

  /* 7️⃣ Clear cart */
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  revalidatePath("/");

  return { ok: true, orderId };
}
