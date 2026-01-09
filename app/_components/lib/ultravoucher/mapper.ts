import type { UltravoucherVoucher } from "@/app/types/ultravoucher";
import type { Voucher } from "@/app/page";

export function mapWidgetVoucherToUi(v: UltravoucherVoucher): Voucher {
  return {
    id: v.id,
    name: v.name,
    price: v.price,
    imageUrl: v.image ?? "",
    merchant: v.brand ?? "-",
  };
}
