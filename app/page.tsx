import type { Metadata } from "next";
import { VoucherList } from "./_components/home/VoucherList";
import { McxPushControls } from "./_components/mcx/McxPushControl";
import { getNonAuthVouchers } from "./_components/lib/ultravoucher/publicClient";

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
  const data = await getNonAuthVouchers("CL-0004", {
    limit: 12,
    page: 1,
  });

  const vouchers = data.docs.map((v) => ({
    id: v.id,
    name: v.name,
    price: v.price,
    imageUrl: v.image,
    merchant: v.clientName,
  }));
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

        <VoucherList vouchers={vouchers} />
        <McxPushControls />
      </div>
    </main>
  );
}

