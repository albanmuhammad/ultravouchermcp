import { getSalesforceAccessTokenClientCredentials } from "./token-client-credentials";
import type { SalesforceMemberProfile } from "./types";

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function getSalesforceMemberProfile(
  memberId: string
): Promise<SalesforceMemberProfile> {
  const token = await getSalesforceAccessTokenClientCredentials();

  const url =
    `${token.instance_url}/services/data/v65.0/loyalty-programs/` +
    `${encodeURIComponent(process.env.SF_LOYALTY_PROGRAM_NAME!)}` +
    `/members?memberId=${encodeURIComponent(memberId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  console.log("res member profile", res);

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SF_GET_MEMBER_FAILED ${res.status}: ${text}`);
  }

  const json: unknown = JSON.parse(text);

  // 🔒 minimal validation

  console.log("json member profile", json);
  if (
    !isObject(json) ||
    typeof json.loyaltyProgramMemberId !== "string" ||
    !Array.isArray(json.memberCurrencies)
  ) {
    throw new Error(`SF_GET_MEMBER_UNEXPECTED_RESPONSE: ${text}`);
  }

  return json as SalesforceMemberProfile;
}
