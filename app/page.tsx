import type { Metadata } from "next";
import { VoucherList } from "./_components/home/VoucherList";

export const metadata: Metadata = {
  title: "Available Vouchers - Ultra Voucher",
  description: "Pilih voucher yang sesuai dengan kebutuhanmu",
};

type Voucher = Readonly<{
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  merchant: string;
}>;

// Nanti bisa diganti dengan fetch dari API
const VOUCHERS: ReadonlyArray<Voucher> = [
  {
    id: "uv-001",
    name: "Voucher Alfamart 50K",
    price: 50_000,
    imageUrl: "https://alfamart.co.id/frontend/img/corporate/tentang-perusahaan/logo-guide/img-logo-dos-2.svg",
    merchant: "Alfamart",
  },
  {
    id: "uv-002",
    name: "Voucher Alfamart 50K",
    price: 50_000,
    imageUrl: "https://alfamart.co.id/frontend/img/corporate/tentang-perusahaan/logo-guide/img-logo-dos-2.svg",
    merchant: "Alfamart",
  },
  {
    id: "uv-003",
    name: "Voucher Alfamart 50K",
    price: 50_000,
    imageUrl: "https://alfamart.co.id/frontend/img/corporate/tentang-perusahaan/logo-guide/img-logo-dos-2.svg",
    merchant: "Alfamart",
  },
  {
    id: "uv-004",
    name: "Voucher Alfamart 50K",
    price: 50_000,
    imageUrl: "https://alfamart.co.id/frontend/img/corporate/tentang-perusahaan/logo-guide/img-logo-dos-2.svg",
    merchant: "Alfamart",
  },
  {
    id: "uv-005",
    name: "Voucher Alfamart 50K",
    price: 50_000,
    imageUrl: "https://alfamart.co.id/frontend/img/corporate/tentang-perusahaan/logo-guide/img-logo-dos-2.svg",
    merchant: "Alfamart",
  },
  // ... vouchers lainnya
];

export default function HomePage() {
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

        <VoucherList vouchers={VOUCHERS} />
      </div>
    </main>
  );
}

export type { Voucher };