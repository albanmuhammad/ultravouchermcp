type ClientCredentialsTokenResponse = Readonly<{
  access_token: string;
  instance_url: string;
  token_type: string;
  issued_at?: string;
  signature?: string;
}>;

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isTokenResponse(x: unknown): x is ClientCredentialsTokenResponse {
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

export async function getSalesforceAccessTokenClientCredentials(): Promise<ClientCredentialsTokenResponse> {
  const loginUrl = mustEnv("SF_LOGIN_URL");
  const clientId = mustEnv("SF_CLIENT_ID");
  const clientSecret = mustEnv("SF_CLIENT_SECRET");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    return Promise.reject(new Error(`Token error ${res.status}: ${text}`));
  }

  const json: unknown = JSON.parse(text);
  if (!isTokenResponse(json)) {
    throw new Error("Unexpected token response shape");
  }
  return json;
}
