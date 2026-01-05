import type { UltravoucherResponse } from "@/app/types/ultravoucher";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function getNonAuthVouchers(
  clientId: string,
  params?: Readonly<{
    limit?: number;
    page?: number;
    orderField?: string;
    orderType?: "ASC" | "DESC";
  }>
): Promise<UltravoucherResponse["data"]> {
  const baseUrl = mustEnv("UV_BASE_SYSTEM_URL");

  const searchParams = new URLSearchParams({
    limit: String(params?.limit ?? 12),
    page: String(params?.page ?? 1),
    orderField: params?.orderField ?? "createdAt",
    orderType: params?.orderType ?? "DESC",
  });

  const res = await fetch(
    `${baseUrl}/v1/vouchers/non-auth/${clientId}?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store", // always fresh on page load
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UV non-auth error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as UltravoucherResponse;

  if (json.meta.code !== 0) {
    throw new Error(`UV non-auth meta.code is not 0 (code=${json.meta.code})`);
  }

  return json.data;
}
