import type { Metadata } from "next";
import { VoucherList } from "./_components/home/VoucherList";
import { McxPushControls } from "./_components/mcx/McxPushControl";
import { getNonAuthVouchers } from "./_components/lib/ultravoucher/publicClient";
import { getWidgetVouchers } from "./_components/lib/ultravoucher/widgetClient";
import { createSupabaseServerClient } from "@/app/_components/lib/supabase/server";
import { getWidgetAccessKey } from "./_components/lib/ultravoucher/widgetSession";
import { cookies } from "next/headers";
import { logoutAction } from "./actions/auth";
import { MOCK_VOUCHERS } from "./_mock/vouchers";
import { UltravoucherVoucher } from "./types/ultravoucher";

export const metadata: Metadata = {
  title: "Available Vouchers - Ultra Voucher",
  description: "Pilih voucher yang sesuai dengan kebutuhanmu",
};




export default async function HomePage() {
  let vouchers: ReadonlyArray<UltravoucherVoucher> = [];
  let isLoggedIn = false;
  const USE_MOCK = false;


  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const widgetToken = await getWidgetAccessKey();
  let forceLogout = false;

  // If user has Supabase session but NO UV token - logout from Supabase
  if (user && !widgetToken) {
    console.log('Supabase user without UV token - logging out Supabase');
    forceLogout = true;

    // After logout, show public vouchers
    const data = await getNonAuthVouchers("CL-0004", {
      limit: 12,
      page: 1,
    });

    vouchers = USE_MOCK
      ? MOCK_VOUCHERS
      : data.docs;

  }
  // User has both Supabase and UV token
  else if (user && widgetToken) {
    isLoggedIn = true;
    try {
      console.log('Authenticated user with UV token');
      const data = await getWidgetVouchers(widgetToken, {
        limit: 12,
        page: 1,
      });

      vouchers = USE_MOCK
        ? MOCK_VOUCHERS
        : data.docs;

    } catch (err) {
      console.error('Widget token error:', err);

      // Clear expired widget token AND logout from Supabase
      forceLogout = true;
      // Show public vouchers
      const data = await getNonAuthVouchers("CL-0004", {
        limit: 12,
        page: 1,
      });

      vouchers = USE_MOCK
        ? MOCK_VOUCHERS
        : data.docs;

    }
  }
  // Widget-only user (no Supabase session)
  else if (widgetToken) {
    try {
      console.log('Widget-only user (no Supabase session)');
      const data = await getWidgetVouchers(widgetToken, {
        limit: 12,
        page: 1,
      });

      vouchers = USE_MOCK
        ? MOCK_VOUCHERS
        : data.docs;


      isLoggedIn = true;
    } catch (err) {
      console.error('Widget token error:', err);

      // Clear expired widget token
      forceLogout = true;

      // Show public vouchers
      const data = await getNonAuthVouchers("CL-0004", {
        limit: 12,
        page: 1,
      });

      vouchers = USE_MOCK
        ? MOCK_VOUCHERS
        : data.docs;

    }
  }
  // Non-authenticated user
  else {
    console.log('Public non-auth flow');
    const data = await getNonAuthVouchers("CL-0004", {
      limit: 12,
      page: 1,
    });

    vouchers = USE_MOCK
      ? MOCK_VOUCHERS
      : data.docs;

  }

  // vouchers = MOCK_VOUCHERS.map(v => ({
  //   id: v.id,
  //   name: v.name,
  //   price: v.price,
  //   imageUrl: v.image,
  //   merchant: v.clientName,
  // }));


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
          {/* <div id="homepage-voucher-banner"></div> */}
          <p style={{
            fontSize: 16,
            color: "#666",
            fontWeight: 400
          }}>
            Pilih voucher yang sesuai dengan kebutuhanmu
          </p>
        </header>

        <VoucherList vouchers={vouchers} isLoggedIn={isLoggedIn} forceLogout={forceLogout} />
        {/* <McxPushControls /> */}
      </div>
    </main>
  );
}