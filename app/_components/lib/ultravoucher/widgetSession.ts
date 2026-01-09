import { cookies } from "next/headers";

export async function getWidgetAccessKey(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("uv_access_key")?.value ?? null;
  return token;
}
