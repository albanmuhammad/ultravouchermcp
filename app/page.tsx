import type { Metadata } from "next";
import { VoucherList } from "./_components/home/VoucherList";
import { McxPushControls } from "./_components/mcx/McxPushControl";
import { getNonAuthVouchers } from "./_components/lib/ultravoucher/publicClient";
import { getUltraVoucherToken } from "./_components/lib/ultravoucher/client";
import { getWidgetVouchers } from "./_components/lib/ultravoucher/widgetClient";
import { mapWidgetVoucherToUi } from "./_components/lib/ultravoucher/mapper";
import { createSupabaseServerClient } from "@/app/_components/lib/supabase/server";
import { getWidgetAccessKey } from "./_components/lib/ultravoucher/widgetSession";
import { WidgetUnauthorizedError } from "./_components/lib/ultravoucher/errors";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { logoutAction } from "./actions/auth";

export const metadata: Metadata = {
  title: "Available Vouchers - Ultra Voucher",
  description: "Pilih voucher yang sesuai dengan kebutuhanmu",
};

export type Voucher = Readonly<{
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  merchant: string;
}>;


export default async function HomePage() {

  const handleLogout = async () => {
    await logoutAction();
  };


  let vouchers: Voucher[] = [];
  let isLoggedIn = false;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();


  const widgetToken = await getWidgetAccessKey();

  if (!widgetToken) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
  }

  // Widget auth flow
  if (widgetToken) {
    try {
      const data = await getWidgetVouchers(widgetToken, {
        limit: 12,
        page: 1,
      });
      vouchers = data.docs.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        imageUrl: v.image ?? "",
        merchant: v.brand ?? "-",
      }));
    } catch (err) {
      if (err instanceof WidgetUnauthorizedError) {
        redirect("/login?reason=session_expired");
      } else {
        throw err;
      }
    }
  }
  // Supabase auth flow
  else if (isLoggedIn) {
    // Handle logged in user with Supabase
    const token = await getUltraVoucherToken(); // or however you get this
    const data = await getWidgetVouchers(token, {
      limit: 12,
      page: 1,
    });
    vouchers = data.docs.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      imageUrl: v.image ?? "",
      merchant: v.brand ?? "-",
    }));
  }
  // Non-auth flow
  else {
    const data = await getNonAuthVouchers("CL-0004", {
      limit: 12,
      page: 1,
    });
    vouchers = data.docs.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      imageUrl: v.image,
      merchant: v.clientName,
    }));
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      padding: "40px 20px"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto"
      }}>
        <header style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            color: "#1a1a1a"
          }}>
            Available Vouchers
          </h1>
          <p style={{
            fontSize: 16,
            color: "#666",
            fontWeight: 400
          }}>
            Pilih voucher yang sesuai dengan kebutuhanmu
          </p>
        </header>

        <VoucherList vouchers={vouchers} isLoggedIn={isLoggedIn} />
        <McxPushControls />
      </div>
    </main>
  );
}

