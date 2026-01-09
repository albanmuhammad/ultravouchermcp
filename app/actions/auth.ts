"use server";

import { createSupabaseServerActionClient } from "../_components/lib/supabase/server-action";
import type { ProfileInsert } from "@/app/types/db";
import { cookies } from "next/headers";

import { registerUltraVoucherCustomer } from "@/app/_components/lib/ultravoucher/register-customer";
import { enrollSalesforceIndividualMember } from "@/app/_components/lib/salesforce/enroll-individual-member";
import { topupUltraVoucherPoint } from "../_components/lib/ultravoucher/topup";

type ActionOk = Readonly<{ ok: true }>;
type ActionFail = Readonly<{ ok: false; message: string }>;
export type ActionResult = ActionOk | ActionFail;

export type RegisterInput = Readonly<{
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
}>;

export type LoginInput = Readonly<{
  email: string;
  password: string;
}>;

/* ---------------- helpers ---------------- */

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

function fail(message: string): ActionFail {
  return { ok: false, message };
}

/* ---------------- REGISTER ---------------- */

export async function registerAction(
  input: RegisterInput
): Promise<ActionResult> {
  // 0️⃣ Validate
  if (!isNonEmptyString(input.email)) return fail("Email wajib diisi.");
  if (!isNonEmptyString(input.password)) return fail("Password wajib diisi.");
  if (!isNonEmptyString(input.phone)) return fail("Nomor HP wajib diisi.");
  if (!isNonEmptyString(input.firstName))
    return fail("First name wajib diisi.");
  if (!isNonEmptyString(input.lastName)) return fail("Last name wajib diisi.");

  const supabase = await createSupabaseServerActionClient();

  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const fullName = buildFullName(firstName, lastName);
  const phone = input.phone.trim();

  /* 1️⃣ Supabase Auth */
  const signUpRes = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        phone,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
      },
    },
  });

  if (signUpRes.error) return fail(signUpRes.error.message);

  const userId = signUpRes.data.user?.id;
  if (!userId) return fail("Register gagal: userId tidak terbentuk.");

  /* 2️⃣ Integrations (PARALLEL, PARTIAL FAILURE OK) */
  let ultraVoucherMemberId: string | null = null;
  let salesforceMemberId: string | null = null;
  let salesforcePersonAccountId: string | null = null;

  await Promise.allSettled([
    (async () => {
      try {
        ultraVoucherMemberId = await registerUltraVoucherCustomer({
          phone,
          countryCode: "62",
          email,
          fullName,
        });
        await topupUltraVoucherPoint({
          userId: ultraVoucherMemberId,
          point: 500_000,
        });
      } catch (err) {
        console.error("[UV] register failed", err);
      }
    })(),

    (async () => {
      try {
        const sf = await enrollSalesforceIndividualMember({
          programName: process.env.SF_LOYALTY_PROGRAM_NAME!,
          email,
          firstName,
          lastName,
          membershipNumber: `MBR-${userId.slice(0, 8)}`,
        });
        salesforceMemberId = sf.loyaltyProgramMemberId;
        salesforcePersonAccountId = sf.contactId;
        console.log(sf);
      } catch (err) {
        console.error("[SF] enroll failed", err);
      }
    })(),
  ]);

  /* 3️⃣ Upsert profile */
  const profile: ProfileInsert = {
    id: userId,
    email,
    phone,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    ultra_voucher_member_id: ultraVoucherMemberId,
    salesforce_loyalty_member_id: salesforceMemberId,
    salesforce_person_account_id: salesforcePersonAccountId,
  };

  const upsertRes = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });

  if (upsertRes.error) return fail(upsertRes.error.message);

  return { ok: true };
}

/* ---------------- LOGIN ---------------- */

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  if (!isNonEmptyString(input.email)) return fail("Email wajib diisi.");
  if (!isNonEmptyString(input.password)) return fail("Password wajib diisi.");

  const supabase = await createSupabaseServerActionClient();
  const email = normalizeEmail(input.email);

  const res = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (res.error) return fail(res.error.message);

  return { ok: true };
}

/* ---------------- LOGOUT ---------------- */

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerActionClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("uv_access_key");
}
