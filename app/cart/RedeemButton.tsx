"use client";

import { useTransition, useState } from "react";
import { redeemCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";

type RedeemItem = Readonly<{
    voucher_id: string;
    point_price: number;
    quantity: number;
}>;

type Props = Readonly<{
    items: ReadonlyArray<RedeemItem>;
}>;

type RedeemStatus = "idle" | "success" | "error";

export function RedeemButton({ items }: Props) {
    const [pending, start] = useTransition();
    const [status, setStatus] = useState<RedeemStatus>("idle");
    const router = useRouter();

    const handleRedeem = (): void => {
        const orderId = crypto.randomUUID();

        const totalPoints = items.reduce(
            (sum, item) => sum + item.point_price * item.quantity,
            0
        );

        const lineItems = items.map((item) => ({
            _id: item.voucher_id,
            price: item.point_price,
            quantity: item.quantity,
        }));

        window.Evergage?.sendEvent({
            itemAction: "Purchase",
            order: {
                Product: {
                    orderId,
                    totalValue: totalPoints,
                    currency: "IDR",
                    lineItems,
                },
            },
        });

        start(async () => {
            try {
                await redeemCart();
                setStatus("success")
                // alert("Redeem success 🎉");
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } catch {
                alert("Redeem failed");
            }
        });
    };

    return (
        <>
            <button
                onClick={handleRedeem}
                disabled={pending}
                className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-60"
            >
                {pending ? "Processing..." : "Redeem Now"}
            </button>

            {/* SUCCESS MODAL */}
            {status === "success" && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
                        <h2 className="text-2xl font-bold mb-2">🎉 Redeem Berhasil</h2>
                        <p className="text-gray-600 mb-6">
                            Voucher kamu sedang diproses.
                        </p>
                        <p className="text-sm text-gray-400">
                            Mengalihkan ke homepage...
                        </p>
                    </div>
                </div>
            )}

            {/* ERROR MODAL */}
            {status === "error" && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
                        <h2 className="text-xl font-bold mb-2 text-red-600">
                            ❌ Redeem Gagal
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Terjadi kesalahan saat redeem voucher.
                        </p>
                        <button
                            onClick={() => setStatus("idle")}
                            className="px-6 py-2 bg-gray-200 rounded-lg font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
