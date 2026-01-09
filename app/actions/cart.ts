"use server";

import { createSupabaseServerActionClient } from "../_components/lib/supabase/server-action";

export type AddToCartInput = {
  voucherId: string;
  voucherName: string;
  price: number;
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
