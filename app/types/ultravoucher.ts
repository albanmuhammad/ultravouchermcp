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
