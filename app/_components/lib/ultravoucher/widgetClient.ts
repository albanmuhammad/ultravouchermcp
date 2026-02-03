import type {
  UltravoucherV2ListResponse,
  UltravoucherV2DetailResponse,
  UltravoucherVoucher,
} from "@/app/types/ultravoucher";
import { WidgetUnauthorizedError } from "./errors";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/* =========================
 * LIST FETCH
 * ========================= */
async function widgetFetchList(
  token: string,
  searchParams: URLSearchParams,
): Promise<UltravoucherV2ListResponse> {
  const baseUrl = mustEnv("UV_BASE_SYSTEM_URL");
  const url = `${baseUrl}/v2/widget/vouchers?${searchParams.toString()}`;

  console.log(url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    await handleWidgetError(res);
  }

  const json = (await res.json()) as UltravoucherV2ListResponse;

  if (json.meta.code !== 0) {
    throw new Error(`UV meta.code != 0 (${json.meta.code})`);
  }

  return json;
}

/* =========================
 * DETAIL FETCH (BY ID)
 * ========================= */
async function widgetFetchById(
  token: string,
  voucherId: string,
): Promise<UltravoucherVoucher> {
  const baseUrl = mustEnv("UV_BASE_SYSTEM_URL");
  const url = `${baseUrl}/v2/widget/vouchers/${voucherId}`;

  console.log(url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    await handleWidgetError(res);
  }

  const json = (await res.json()) as UltravoucherV2DetailResponse;

  if (json.meta.code !== 0) {
    throw new Error(`UV meta.code != 0 (${json.meta.code})`);
  }

  return json.data;
}

/* =========================
 * PUBLIC APIS
 * ========================= */
export async function getWidgetVouchers(
  token: string,
  params?: Readonly<{
    page?: number;
    limit?: number;
    orderField?: "point" | "createdAt" | "name";
    orderType?: "ASC" | "DESC";
  }>,
): Promise<UltravoucherV2ListResponse["data"]> {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
    orderField: params?.orderField ?? "point",
    orderType: params?.orderType ?? "ASC",
  });

  const json = await widgetFetchList(token, searchParams);
  return json.data;
}

export async function getWidgetVoucherById(
  token: string,
  voucherId: string,
): Promise<UltravoucherVoucher | null> {
  try {
    return await widgetFetchById(token, voucherId);
  } catch (e) {
    if (e instanceof WidgetUnauthorizedError) {
      throw e;
    }
    return null;
  }
}

/* =========================
 * ERROR HANDLER (SHARED)
 * ========================= */
async function handleWidgetError(res: Response): Promise<never> {
  const text = await res.text();

  try {
    const json = JSON.parse(text);
    if (
      json.errorCode === "E3" ||
      json.msg?.includes("Not found user detail data")
    ) {
      throw new WidgetUnauthorizedError();
    }
  } catch {
    // ignore JSON parse error
  }

  if (res.status === 401) {
    throw new WidgetUnauthorizedError();
  }

  throw new Error(`UV widget error ${res.status}: ${text}`);
}
