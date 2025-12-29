import { NextResponse } from "next/server";
import { getUltraVoucherToken } from "@/app/_components/lib/ultravoucher/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getUltraVoucherToken();
    return NextResponse.json({
      ok: true,
      message: "UltraVoucher connection OK",
      tokenPreview: token.slice(0, 10) + "...",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
