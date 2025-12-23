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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // Next 16: async

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // ✅ Force the NEW cookie interface (non-deprecated overload)
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
