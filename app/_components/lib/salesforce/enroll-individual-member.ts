import { getSalesforceAccessTokenClientCredentials } from "./token-client-credentials";

type EnrollInput = Readonly<{
  programName: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipNumber: string;
}>;

type EnrollResult = Readonly<{
  loyaltyProgramMemberId: string;
  personAccountId: string;
}>;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function enrollSalesforceIndividualMember(
  input: EnrollInput
): Promise<EnrollResult> {
  const token = await getSalesforceAccessTokenClientCredentials();

  const url =
    `${token.instance_url}/services/data/v55.0/loyalty-programs/` +
    `${encodeURIComponent(input.programName)}/individual-member-enrollments`;

  const body = {
    enrollmentDate: new Date().toISOString(),
    membershipNumber: input.membershipNumber,
    memberStatus: "Active",
    enrollmentChannel: "Web",

    associatedContactDetails: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      allowDuplicateRecords: "true", // STRING
    },

    canReceivePromotions: "true",
    canReceivePartnerPromotions: "true",

    // TAMBAHKAN HANYA JIKA FIELD EXIST DI ORG
    // additionalMemberFieldValues: {
    //   attributes: {
    //     CustomBoolean__c: "true",
    //   },
    // },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SF enroll failed ${res.status}: ${text}`);
  }

  const json: unknown = JSON.parse(text);

  if (
    !isObject(json) ||
    typeof json.loyaltyProgramMemberId !== "string" ||
    typeof json.personAccountId !== "string"
  ) {
    throw new Error(`SF enroll unexpected response: ${text}`);
  }

  return {
    loyaltyProgramMemberId: json.loyaltyProgramMemberId,
    personAccountId: json.personAccountId,
  };
}
