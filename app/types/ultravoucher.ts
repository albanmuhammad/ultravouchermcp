/* =========================
 * SHARED META
 * ========================= */
export type UltravoucherMeta = Readonly<{
  code: number;
  message?: string;
}>;

/* =========================
 * PRICE (voucherPrices)
 * ========================= */
export type UltravoucherPrice = Readonly<{
  id: string;
  originalRupee: number;
  finalRupee: number;
  originalPoint: number;
  finalPoint: number;
  applyDiscount: boolean;
  visible: boolean;
}>;

/* =========================
 * VOUCHER CORE (dipakai list & detail)
 * ========================= */
export type UltravoucherVoucher = Readonly<{
  id: string;
  name: string;
  price: number;
  image: string;
  clientName: string;
  merchantCode: string;
  stockAvailable: number;
  voucherPrices: ReadonlyArray<UltravoucherPrice>;
}>;

/* =========================
 * V2 LIST RESPONSE
 * GET /v2/widget/vouchers
 * ========================= */
export type UltravoucherV2ListResponse = Readonly<{
  meta: UltravoucherMeta;
  data: Readonly<{
    docs: ReadonlyArray<UltravoucherVoucher>;
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
  }>;
}>;

/* =========================
 * V2 DETAIL RESPONSE
 * GET /v2/widget/vouchers/:id
 * ========================= */
export type UltravoucherV2DetailResponse = Readonly<{
  meta: UltravoucherMeta;
  data: UltravoucherVoucher;
}>;

/* =========================
 * (LEGACY) V1 RESPONSE
 * kalau masih dipakai, aman
 * ========================= */
export type UltravoucherResponse = Readonly<{
  meta: {
    code: number;
  };
  data: {
    docs: ReadonlyArray<UltravoucherVoucher>;
    totalDocs: number;
    totalPages: number;
  };
}>;

export type MyVoucher = Readonly<{
  id: string;
  voucherId: string;
  name: string;
  nominal: number;
  purchasePrice: number;
  quantity: number;
  merchantCode: string;
  imageUrl: string;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  expiredAt: string;
  url: string; // base64 encoded
}>;

export type MyVoucherResponse = Readonly<{
  data: {
    docs: ReadonlyArray<MyVoucher>;
    totalDocs: number;
    totalPages: number;
  };
}>;
