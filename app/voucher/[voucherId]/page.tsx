import { notFound } from "next/navigation";
import type { UltravoucherVoucher } from "@/app/types/ultravoucher";
import { AddToCartButton } from "./AddToCartButton";
import { getWidgetAccessKey } from "@/app/_components/lib/ultravoucher/widgetSession";
import { getWidgetVoucherById } from "@/app/_components/lib/ultravoucher/widgetClient";

type PageProps = {
    params: Promise<{
        voucherId: string;
    }>;
};

function getVisiblePrice(voucher: UltravoucherVoucher) {
    return voucher.voucherPrices.find((p) => p.visible);
}

export default async function VoucherDetailPage({ params }: PageProps) {
    const { voucherId } = await params;
    const token = await getWidgetAccessKey();

    if (!token) {
        notFound();
    }

    const voucher = await getWidgetVoucherById(token, voucherId);

    if (!voucher) {
        notFound();
    }

    const visiblePrice = getVisiblePrice(voucher);
    const finalPoint = visiblePrice?.finalPoint;
    const stock = voucher.stockAvailable;
    const isOutOfStock = stock <= 0;

    return (
        <main className="min-h-screen bg-gray-50 p-10">
            {/* Tracking / Data Layer */}
            <div
                id="voucher-detail"
                data-voucher-id={voucher.id}
                data-voucher-name={voucher.name}
                data-voucher-price={voucher.price}
                data-voucher-point={finalPoint}
                data-voucher-stock={stock}
            />

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
                <img
                    src={voucher.image}
                    alt={voucher.name}
                    className="w-full rounded-xl mb-6"
                />

                <h1 className="text-2xl font-extrabold">{voucher.name}</h1>

                {/* Rupiah */}
                <p className="text-xl text-blue-600 font-bold mt-2">
                    Rp {voucher.price.toLocaleString("id-ID")}
                </p>

                {/* Point */}
                {finalPoint !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                        {finalPoint.toLocaleString("id-ID")} Point
                    </p>
                )}

                {/* Merchant */}
                <p className="text-gray-600 mt-2">
                    {/* Merchant: <strong>{voucher.clientName}</strong> */}
                </p>

                {/* Stock */}
                <p
                    className={`mt-2 font-semibold ${isOutOfStock ? "text-red-600" : "text-green-600"
                        }`}
                >
                    {isOutOfStock ? "Stok habis" : `Stok tersedia: ${stock}`}
                </p>

                {/* CTA */}
                <div className="mt-6">
                    <AddToCartButton
                        voucherId={voucher.id}
                        voucherName={voucher.name}
                        price={voucher.price}
                        pointPrice={finalPoint!}
                        disabled={isOutOfStock}
                    />
                </div>
            </div>
        </main>
    );
}
