"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";

type Props = Readonly<{
    voucherId: string;
    voucherName: string;
    price: number;
}>;

export function AddToCartButton({
    voucherId,
    voucherName,
    price,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleClick = () => {
        // ✅ MCP AddToCart (DOCUMENTATION-CORRECT)
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
                });

                // ✅ Redirect ke cart setelah sukses
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
            disabled={isPending}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-60"
        >
            {isPending ? "Adding..." : "Add to Cart"}
        </button>
    );
}
