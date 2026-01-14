import type { UltravoucherV2Response } from "@/app/types/ultravoucher";
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

  if (!res.ok) {
    const text = await res.text();

    // Try to parse as JSON to check for E3 error
    try {
      const json = JSON.parse(text);
      if (
        json.errorCode === "E3" ||
        json.msg?.includes("Not found user detail data")
      ) {
        throw new WidgetUnauthorizedError();
      }
    } catch (e) {
      // If not JSON or doesn't have E3 error, continue with normal error handling
    }

    if (res.status === 401) {
      throw new WidgetUnauthorizedError();
    }

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
