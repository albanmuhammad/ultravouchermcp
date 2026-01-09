"use server";

import { cookies } from "next/headers";
import { getUltraVoucherToken } from "@/app/_components/lib/ultravoucher/client";

type LoginCustomerInput = Readonly<{
  phone: string;
  countryCode: string;
  email: string;
}>;

export async function loginUvCustomer(
  input: LoginCustomerInput
): Promise<void> {
  const systemToken = await getUltraVoucherToken();

  const res = await fetch(
    `${process.env.UV_BASE_CONNECTOR_URL}/v1/b2b/customers/connect`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${systemToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      cache: "no-store",
    }
  );

  const json = (await res.json()) as {
    meta: { code: number };
    data: { accessKey: string };
  };

  if (json.meta.code !== 0) {
    throw new Error("UV customer login failed");
  }

  const cookieStore = await cookies();
  cookieStore.set("uv_access_key", json.data.accessKey, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}
