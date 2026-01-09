"use client";

import { useTransition } from "react";
import { removeFromCart } from "@/app/actions/cart";

type Props = Readonly<{
    cartItemId: string;
    voucherId: string;
    voucherName: string;
    price: number;
}>;

export function RemoveFromCartButton({
    cartItemId,
    voucherId,
    voucherName,
    price,
}: Props) {
    const [isPending, startTransition] = useTransition();

    const handleRemove = () => {
        // ✅ MCP RemoveFromCart (DOCUMENTATION-CORRECT)
        window.Evergage?.sendEvent({
            itemAction: "Remove From Cart",
            cart: {
                singleLine: {
                    Product: {
                        _id: voucherId,
                        name: voucherName,
                        price,
                        quantity: 1,
                    },
                },
            },
        });

        startTransition(async () => {
            try {
                await removeFromCart(cartItemId);
                window.location.reload(); // simple & safe for now
            } catch (err) {
                if (err instanceof Error && err.message === "UNAUTHENTICATED") {
                    alert("Please login first");
                } else {
                    alert("Failed to remove item");
                }
            }
        });
    };

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-sm text-red-600 hover:underline disabled:opacity-60"
        >
            {isPending ? "Removing..." : "Remove"}
        </button>
    );
}
