import { getUltraVoucherToken } from "./client";
import { getWidgetAccessKey } from "./widgetSession";

// ultravoucher/systemFetch.ts
function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function ultraVoucherSystemFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = mustEnv("UV_BASE_SYSTEM_URL");
  const token = await getWidgetAccessKey();

  const url = new URL(path, baseUrl).toString();

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });
}
