"use client";

import { useEffect } from "react";
import { VoucherCard } from "./VoucherCard";
import { logoutAction } from "@/app/actions/auth";
import { UltravoucherVoucher } from "@/app/types/ultravoucher";

type VoucherListProps = {
    vouchers: ReadonlyArray<UltravoucherVoucher>;
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
