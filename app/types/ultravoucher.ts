export type UltravoucherPrice = Readonly<{
  id: string;
  originalRupee: number;
  finalRupee: number;
  applyDiscount: boolean;
  visible: boolean;
}>;

export type UltravoucherItem = Readonly<{
  id: string;
  name: string;
  price: number;
  image: string;
  clientName: string;
  voucherPrices: ReadonlyArray<UltravoucherPrice>;
}>;

export type UltravoucherResponse = Readonly<{
  meta: {
    code: number;
  };
  data: {
    docs: ReadonlyArray<UltravoucherItem>;
    totalDocs: number;
    totalPages: number;
  };
}>;

export type UltravoucherMeta = Readonly<{
  code: number;
  message?: string;
}>;

export type UltravoucherVoucher = Readonly<{
  id: string;
  name: string;
  point: number;
  price: number;
  image?: string;
  brand?: string;
  category?: string;
}>;

export type UltravoucherV2Response = Readonly<{
  meta: UltravoucherMeta;
  data: Readonly<{
    docs: ReadonlyArray<UltravoucherVoucher>;
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
  }>;
}>;
