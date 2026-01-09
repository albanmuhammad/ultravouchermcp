"use client";

import { useEffect } from "react";

type Props = Readonly<{
    voucherId: string;
    voucherName: string;
    price: number;
}>;

export function ViewVoucherEvent({
    voucherId,
    voucherName,
    price,
}: Props) {
    useEffect(() => {
        const sdk = window.Evergage;
        if (!sdk) return;

        sdk.sendEvent({
            itemAction: "View Item",
            catalog: {
                Product: {
                    _id: voucherId,
                    name: voucherName,
                    price,
                },
            },
        });
    }, [voucherId, voucherName, price]);

    return null;
}
