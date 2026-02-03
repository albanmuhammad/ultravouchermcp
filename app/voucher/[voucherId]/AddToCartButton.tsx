"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";

type Props = Readonly<{
    voucherId: string;
    voucherName: string;
    price: number;
    pointPrice: number;
    disabled?: boolean;
}>;

export function AddToCartButton({
    voucherId,
    voucherName,
    price,
    pointPrice,
    disabled = false,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleClick = () => {
        if (disabled) return;

        window.Evergage?.sendEvent({
            itemAction: "Add To Cart",
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
                await addToCart({
                    voucherId,
                    voucherName,
                    price,
                    pointPrice,
                });

                router.push("/cart");
            } catch (err) {
                if (err instanceof Error && err.message === "UNAUTHENTICATED") {
                    alert("Please login first");
                } else {
                    alert("Failed to add to cart");
                }
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isPending}
            className={`mt-6 w-full py-3 rounded-xl font-bold transition
        ${disabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }
        disabled:opacity-60
      `}
        >
            {disabled
                ? "Stok Habis"
                : isPending
                    ? "Adding..."
                    : "Redeem Voucher"}
        </button>
    );
}
