import { ultraVoucherFetch } from "@/app/_components/lib/ultravoucher/client";

type UvTopupResponse = Readonly<{
  meta?: { code?: number };
  data?: unknown;
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

export async function topupUltraVoucherPoint(input: {
  userId: string;
  point: number;
}): Promise<void> {
  const res = await ultraVoucherFetch("/v1/b2b/customers/top-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      point: input.point,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`UV topup failed ${res.status}: ${text}`);
  }

  const json: unknown = JSON.parse(text);

  if (
    !isObject(json) ||
    !isObject(json.meta) ||
    !hasNumberProp(json.meta, "code") ||
    json.meta.code !== 0
  ) {
    throw new Error(`UV topup unexpected response: ${text}`);
  }
}
