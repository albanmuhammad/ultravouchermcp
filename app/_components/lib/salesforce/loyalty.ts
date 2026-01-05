import { getSalesforceAccessTokenClientCredentials } from "./token-client-credentials";
import type {
  SfIndividualMemberEnrollment,
  SfEnrollmentResponse,
} from "./types";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function enrollSalesforceIndividualMember(
  enrollment: SfIndividualMemberEnrollment
): Promise<SfEnrollmentResponse> {
  const token = await getSalesforceAccessTokenClientCredentials();

  const programName = mustEnv("SF_LOYALTY_PROGRAM_NAME");

  const url = `${
    token.instance_url
  }/services/data/v55.0/loyalty-programs/${encodeURIComponent(
    programName
  )}/individual-member-enrollments`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(enrollment),
    cache: "no-store",
  });

  const json: unknown = await res.json();

  if (!res.ok || !isObject(json)) {
    throw new Error("Salesforce loyalty enrollment failed");
  }

  const loyaltyProgramMemberId = json.loyaltyProgramMemberId;
  const personAccountId = json.personAccountId;

  if (
    typeof loyaltyProgramMemberId !== "string" ||
    typeof personAccountId !== "string"
  ) {
    throw new Error("Unexpected Salesforce enrollment response shape");
  }

  return {
    loyaltyProgramMemberId,
    personAccountId,
  };
}
