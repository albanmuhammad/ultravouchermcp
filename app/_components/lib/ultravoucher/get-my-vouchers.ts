import { ultraVoucherSystemFetch } from "./systemFetch";
import type { MyVoucherResponse } from "@/app/types/ultravoucher";

export async function getMyVouchers(): Promise<MyVoucherResponse> {
  const res = await ultraVoucherSystemFetch(
    "/v2/widget/my-vouchers?page=1&size=1000&status=AVAILABLE",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET_MY_VOUCHERS_FAILED: ${text}`);
  }

  return res.json();
}
