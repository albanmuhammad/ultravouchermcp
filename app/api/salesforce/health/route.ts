import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenResponse = Readonly<{
  access_token: string;
  instance_url: string;
  token_type: string;
}>;

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isTokenResponse(x: unknown): x is TokenResponse {
  return (
    typeof x === "object" &&
    x !== null &&
    "access_token" in x &&
    typeof (x as Record<string, unknown>).access_token === "string" &&
    "instance_url" in x &&
    typeof (x as Record<string, unknown>).instance_url === "string" &&
    "token_type" in x &&
    typeof (x as Record<string, unknown>).token_type === "string"
  );
}

function errorToPlain(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    const cause =
      err.cause instanceof Error
        ? { name: err.cause.name, message: err.cause.message }
        : err.cause;

    return {
      name: err.name,
      message: err.message,
      cause,
      stack: err.stack,
    };
  }
  return { message: "Non-Error thrown", value: String(err) };
}

export async function GET() {
  try {
    const loginUrlRaw = mustEnv("SF_LOGIN_URL");
    const clientId = mustEnv("SF_CLIENT_ID");
    const clientSecret = mustEnv("SF_CLIENT_SECRET");

    // ✅ validate URL (akan throw kalau ada spasi/quote/char aneh)
    const tokenUrl = new URL("/services/oauth2/token", loginUrlRaw).toString();

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          step: "TOKEN_REQUEST",
          status: res.status,
          tokenUrl,
          response: text,
        },
        { status: 502 }
      );
    }

    const json: unknown = JSON.parse(text);
    if (!isTokenResponse(json)) {
      return NextResponse.json(
        { ok: false, step: "TOKEN_SHAPE", tokenUrl, response: json },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Salesforce connection OK",
      tokenUrl,
      instanceUrl: json.instance_url,
      tokenType: json.token_type,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, step: "UNEXPECTED", debug: errorToPlain(err) },
      { status: 500 }
    );
  }
}
