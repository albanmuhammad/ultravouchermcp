"use client";

import { useEffect } from "react";
import type { Voucher } from "@/app/page";
import { VoucherCard } from "./VoucherCard";
import { logoutAction } from "@/app/actions/auth";

type VoucherListProps = {
    vouchers: ReadonlyArray<Voucher>;
    isLoggedIn: boolean;
    forceLogout?: boolean;
};

export function VoucherList({
    vouchers,
    isLoggedIn,
    forceLogout,
}: VoucherListProps) {
    useEffect(() => {
        if (forceLogout) {
            logoutAction();
        }
    }, [forceLogout]);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
            }}
        >
            {vouchers.map((voucher) => (
                <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isLoggedIn={isLoggedIn}
                />
            ))}
        </div>
    );
}
