type UVTokenApiResponse = Readonly<{
  meta?: Readonly<{ code?: number }>;
  data?: Readonly<{ access_token?: string }>;
}>;

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function parseUvTokenResponse(json: unknown): { token: string } {
  if (!isObject(json)) throw new Error("UV token response is not an object");

  const meta = isObject(json.meta) ? json.meta : null;
  const code = meta && typeof meta.code === "number" ? meta.code : null;

  // kalau API kamu selalu pakai meta.code, enforce
  if (code !== 0) {
    throw new Error(`UV token meta.code is not 0 (code=${String(code)})`);
  }

  const data = isObject(json.data) ? json.data : null;
  const token =
    data && typeof data.access_token === "string"
      ? data.access_token.trim()
      : "";

  if (!token) throw new Error("UV token missing data.access_token");
  return { token };
}

// in-memory cache (demo ok)
let cachedToken: { token: string; expiresAtMs: number } | null = null;

function getJwtExpMs(token: string): number | null {
  // decode JWT payload safely without verification (untuk TTL doang)
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payloadB64 = parts[1];
  // base64url -> base64
  const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = Buffer.from(b64 + pad, "base64").toString("utf8");

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isObject(payload)) return null;
  const exp = payload.exp;

  if (typeof exp === "number" && Number.isFinite(exp) && exp > 0) {
    return exp * 1000;
  }
  return null;
}

async function fetchNewToken(): Promise<{
  token: string;
  expiresAtMs: number;
}> {
  const baseUrl = mustEnv("UV_BASE_CONNECTOR_URL");
  const username = mustEnv("UV_SYSTEM_USERNAME");
  const password = mustEnv("UV_SYSTEM_PASSWORD");

  const basic = Buffer.from(`${username}:${password}`, "utf8").toString(
    "base64"
  );

  const res = await fetch(`${baseUrl}/v1/b2b/auth/generate-token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`UltraVoucher token error ${res.status}: ${text}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as UVTokenApiResponse;
  } catch {
    throw new Error(`UltraVoucher token is not JSON: ${text.slice(0, 300)}`);
  }

  const { token } = parseUvTokenResponse(json);

  // TTL: ambil dari exp JWT kalau ada, fallback 30 menit
  const expMs = getJwtExpMs(token);
  const safetyMs = 60_000; // refresh 1 menit sebelum exp
  const fallbackMs = Date.now() + 30 * 60_000;

  const expiresAtMs = expMs
    ? Math.max(Date.now() + 60_000, expMs - safetyMs)
    : fallbackMs;

  return { token, expiresAtMs };
}

export async function getUltraVoucherToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAtMs) {
    return cachedToken.token;
  }
  cachedToken = await fetchNewToken();
  return cachedToken.token;
}

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function ultraVoucherFetch(
  path: string,
  options?: FetchOptions
): Promise<Response> {
  const baseUrl = mustEnv("UV_BASE_CONNECTOR_URL");
  const token = await getUltraVoucherToken();

  const url = new URL(path, baseUrl).toString();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options?.headers ?? {}),
  };

  return fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });
}
