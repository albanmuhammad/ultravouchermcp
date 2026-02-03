import { ultraVoucherFetch } from "./client";

import { ultraVoucherSystemFetch } from "./systemFetch";

export async function redeemUltraVoucher(input: {
  voucherId: string;
  quantity: number;
}) {
  const res = await ultraVoucherSystemFetch(
    `/v2/widget/vouchers/order/${input.voucherId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: input.quantity,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UV_REDEEM_FAILED: ${text}`);
  }
}
