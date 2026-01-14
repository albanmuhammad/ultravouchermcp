"use client";

import { useTransition } from "react";
import { redeemCart } from "@/app/actions/cart";

type CartItemLike = Readonly<{
    voucher_id: string;
    price: number;
    quantity: number;
}>;

type Props = Readonly<{
    items: ReadonlyArray<CartItemLike>;
}>;

export function RedeemButton({ items }: Props) {
    const [pending, start] = useTransition();

    const handleRedeem = (): void => {
        const orderId = crypto.randomUUID();

        const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        window.Evergage?.sendEvent({
            itemAction: "Purchase",
            catalog: {
                Product: {
                    _id: orderId, // ✅ satisfy CatalogItem
                    orderId: orderId,
                    totalValue: total,
                    currency: "IDR",
                    lineItems: {
                        _id: 'a5a9dfcb-a8cb-402b-a9da-3b2339e72f16',
                        price: 50000,
                        quantity: 1,
                    },
                },
            },
        });



        start(async () => {
            try {
                await redeemCart();
                alert("Redeem success 🎉");
            } catch {
                alert("Redeem failed");
            }
        });
    };

    return (
        <button
            onClick={handleRedeem}
            disabled={pending}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-60"
        >
            {pending ? "Processing..." : "Redeem Now"}
        </button>
    );
}
