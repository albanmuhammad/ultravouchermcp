"use server";

import { createSupabaseServerClient } from "../_components/lib/supabase/server";
import type { ProfileInsert } from "@/app/types/db";

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

export async function registerAction(
  input: RegisterInput
): Promise<ActionResult> {
  // --- Validate (TS-safe)
  if (!isNonEmptyString(input.email)) return fail("Email wajib diisi.");
  if (!isNonEmptyString(input.password)) return fail("Password wajib diisi.");
  if (!isNonEmptyString(input.phone)) return fail("Nomor HP wajib diisi.");
  if (!isNonEmptyString(input.firstName))
    return fail("First name wajib diisi.");
  if (!isNonEmptyString(input.lastName)) return fail("Last name wajib diisi.");

  const supabase = await createSupabaseServerClient();

  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const fullName = buildFullName(firstName, lastName);
  const phone = input.phone.trim();

  // 1) Create Auth user
  const signUpRes = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      // optional: metadata on auth.users
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

  // 2) Upsert profile row (public.profiles)
  const profile: ProfileInsert = {
    id: userId,
    email,
    phone,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
  };

  const upsertRes = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });
  if (upsertRes.error) return fail(upsertRes.error.message);

  // Note:
  // - Supabase signUp bisa butuh email confirmation tergantung setting.
  // - Kalau email confirmation ON, session mungkin belum aktif sampai verify.
  return { ok: true };
}

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  if (!isNonEmptyString(input.email)) return fail("Email wajib diisi.");
  if (!isNonEmptyString(input.password)) return fail("Password wajib diisi.");

  const supabase = await createSupabaseServerClient();

  const email = normalizeEmail(input.email);

  const res = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (res.error) return fail(res.error.message);

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
