import { getSalesforceAccessTokenClientCredentials } from "./token-client-credentials";

export async function debitSalesforcePoints(input: {
  memberId: string;
  points: number;
  orderId: string;
}) {
  const token = await getSalesforceAccessTokenClientCredentials();

  const url =
    `${token.instance_url}/services/data/v65.0/connect/loyalty/programs/` +
    `${encodeURIComponent(process.env.SF_LOYALTY_PROGRAM_NAME!)}` +
    `/program-processes/debitPointsMember`; // ✅ HARUS PERSIS

  const body = {
    processParameters: [
      {
        TransactionJournal: {
          ActivityDate: new Date().toISOString(),
          ExternalTransactionNumber: input.orderId,
          InvoiceDate: new Date().toISOString().slice(0, 10),
          JournalTypeName: "Redemption",
          MemberId: input.memberId,
          TransactionAmount: String(input.points),
          Status: "Processed",
        },
        PointsToDebit: input.points,
      },
    ],
  };

  console.log("body debit points", JSON.stringify(body));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  console.log("res debit", res);

  const text = await res.text();

  const json: unknown = JSON.parse(text);

  // 🔒 minimal validation

  console.log("json member profile", json);

  if (!res.ok) {
    throw new Error(`SF_DEBIT_FAILED ${res.status}: ${text}`);
  }
}
