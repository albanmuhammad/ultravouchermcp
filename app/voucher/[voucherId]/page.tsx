import { notFound } from "next/navigation";
import { MOCK_VOUCHERS } from "@/app/_mock/vouchers";
import { ViewVoucherEvent } from "./ViewVoucherEvent";
import { AddToCartButton } from "./AddToCartButton";

type PageProps = {
    params: Promise<{
        voucherId: string;
    }>;
};

export default async function VoucherDetailPage({ params }: PageProps) {
    const { voucherId } = await params; // 🔥 WAJIB

    const voucher = MOCK_VOUCHERS.find(
        (v) => v.id === voucherId
    );

    if (!voucher) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 p-10">
            {/* <ViewVoucherEvent
                voucherId={voucher.id}
                voucherName={voucher.name}
                price={voucher.price}
            /> */}

            <div
                id="voucher-detail"
                data-voucher-id={voucher.id}
                data-voucher-name={voucher.name}
                data-voucher-price={voucher.price}
            />


            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
                <img
                    src={voucher.image}
                    alt={voucher.name}
                    className="w-full rounded-xl mb-6"
                />

                <h1 className="text-2xl font-extrabold">{voucher.name}</h1>

                <p className="text-xl text-blue-600 font-bold mt-2">
                    Rp {voucher.price.toLocaleString("id-ID")}
                </p>

                <p className="text-gray-600 mt-2">
                    Merchant: <strong>{voucher.brand}</strong>
                </p>



                <AddToCartButton
                    voucherId={voucher.id}
                    voucherName={voucher.name}
                    price={voucher.price}
                />
            </div>
        </main>
    );
}
