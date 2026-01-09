import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = Readonly<{
  name: string;
  value: string;
  options?: CookieOptions;
}>;

export async function createSupabaseServerActionClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore
        .getAll()
        .map((c) => ({ name: c.name, value: c.value }));
    },
    setAll(cookiesToSet: ReadonlyArray<CookieToSet>) {
      for (const c of cookiesToSet) {
        cookieStore.set(c.name, c.value, c.options);
      }
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}
