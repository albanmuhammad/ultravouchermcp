import type { UltravoucherV2Response } from "@/app/types/ultravoucher";
import { cookies } from "next/headers";
import { WidgetUnauthorizedError } from "./errors";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function widgetFetch(
  token: string,
  searchParams: URLSearchParams
): Promise<UltravoucherV2Response> {
  const baseUrl = mustEnv("UV_BASE_SYSTEM_URL");

  console.log(`${baseUrl}/v2/widget/vouchers?${searchParams.toString()}`);

  const res = await fetch(
    `${baseUrl}/v2/widget/vouchers?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  if (res.status === 401) {
    throw new WidgetUnauthorizedError();
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UV widget error ${res.status}: ${text}`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UV widget error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as UltravoucherV2Response;

  if (json.meta.code !== 0) {
    throw new Error(`UV meta.code != 0 (${json.meta.code})`);
  }

  return json;
}
export async function getWidgetVouchers(
  token: string,
  params?: Readonly<{
    page?: number;
    limit?: number;
    orderField?: "point" | "createdAt" | "name";
    orderType?: "ASC" | "DESC";
  }>
): Promise<UltravoucherV2Response["data"]> {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
    orderField: params?.orderField ?? "point",
    orderType: params?.orderType ?? "ASC",
  });

  const json = await widgetFetch(token, searchParams);
  return json.data;
}

export async function getWidgetVoucherById(
  token: string,
  voucherId: string
): Promise<UltravoucherV2Response["data"]["docs"][number] | null> {
  const searchParams = new URLSearchParams({
    page: "1",
    limit: "1",
    voucherId: voucherId,
  });

  const json = await widgetFetch(token, searchParams);

  return json.data.docs[0] ?? null;
}
