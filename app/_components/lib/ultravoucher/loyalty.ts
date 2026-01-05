import { ultraVoucherFetch } from "./client";

type RegisterUvCustomerInput = Readonly<{
  email?: string;
  fullName?: string;
  phone?: string;
  countryCode?: string;
}>;

type RegisterUvCustomerResult = Readonly<{
  ultravoucherCustomerId: string;
}>;

type UvCustomerResponse = Readonly<{
  meta?: { code?: number };
  data?: { _id?: string };
}>;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function registerUltraVoucherCustomer(
  input: RegisterUvCustomerInput
): Promise<RegisterUvCustomerResult> {
  const res = await ultraVoucherFetch("/v1/b2b/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      countryCode: input.countryCode,
    }),
  });

  const json = (await res.json()) as UvCustomerResponse;

  if (
    !res.ok ||
    json.meta?.code !== 0 ||
    !isObject(json.data) ||
    typeof json.data._id !== "string"
  ) {
    throw new Error("UltraVoucher customer registration failed");
  }

  return {
    ultravoucherCustomerId: json.data._id,
  };
}
