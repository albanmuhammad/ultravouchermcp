import { ultraVoucherFetch } from "@/app/_components/lib/ultravoucher/client";

type RegisterUvCustomerInput = Readonly<{
  phone?: string;
  countryCode?: string;
  email?: string;
  fullName?: string;
}>;

type UvRegisterResponse = Readonly<{
  meta?: { code?: number };
  data?: { _id?: string };
}>;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function hasNumberProp(
  obj: unknown,
  key: string
): obj is Record<string, number> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    key in obj &&
    typeof (obj as Record<string, unknown>)[key] === "number"
  );
}

export async function registerUltraVoucherCustomer(
  input: RegisterUvCustomerInput
): Promise<string> {
  const res = await ultraVoucherFetch("/v1/b2b/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`UV register failed ${res.status}: ${text}`);
  }

  const json: unknown = JSON.parse(text);

  if (
    !isObject(json) ||
    !isObject(json.meta) ||
    !hasNumberProp(json.meta, "code") ||
    json.meta.code !== 0 ||
    !isObject(json.data) ||
    typeof json.data._id !== "string"
  ) {
    throw new Error(`UV register unexpected response: ${text}`);
  }

  return json.data._id;
}
