"use client";

import { useState } from "react";
import Link from "next/link";
import type { UltravoucherVoucher } from "@/app/types/ultravoucher";

type VoucherCardProps = {
    voucher: UltravoucherVoucher;
    isLoggedIn: boolean;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPoint(value: number): string {
    return new Intl.NumberFormat("id-ID").format(value);
}

function getVisiblePrice(voucher: UltravoucherVoucher) {
    return voucher.voucherPrices.find((p) => p.visible);
}

export function VoucherCard({ voucher, isLoggedIn }: VoucherCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const visiblePrice = getVisiblePrice(voucher);
    const finalPoint = visiblePrice?.finalPoint;
    const stock = voucher.stockAvailable;

    const href = isLoggedIn
        ? `/voucher/${encodeURIComponent(voucher.id)}`
        : `/login?redirect=/voucher/${encodeURIComponent(voucher.id)}`;

    const isOutOfStock = stock <= 0;

    return (
        <Link
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #e5e5e5",
                transition: "all 0.2s ease",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                boxShadow: isHovered
                    ? "0 8px 24px rgba(0,0,0,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                textDecoration: "none",
                color: "inherit",
                display: "block",
                opacity: isOutOfStock ? 0.6 : 1,
            }}
        >
            {/* IMAGE */}
            <div
                style={{
                    position: "relative",
                    overflow: "hidden",
                    height: 160,
                    background: "#f5f5f5",
                }}
            >
                <img
                    src={voucher.image}
                    alt={voucher.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        transform: isHovered ? "scale(1.1)" : "scale(1)",
                    }}
                />

                {/* MERCHANT */}
                {/* <div
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "white",
                        color: "#333",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    {voucher.clientName}
                </div> */}

                {/* STOCK BADGE */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        background: isOutOfStock ? "#ef4444" : "#16a34a",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                    }}
                >
                    {isOutOfStock ? "Habis" : `Sisa ${stock}`}
                </div>
            </div>

            {/* CONTENT */}
            <div
                style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <h3
                    style={{
                        fontSize: 15,
                        fontWeight: 700,
                        margin: 0,
                        color: "#1a1a1a",
                        lineHeight: 1.4,
                    }}
                >
                    {voucher.name}
                </h3>

                {/* PRICE */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginTop: 4,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: "#2563eb",
                            }}
                        >
                            {formatRupiah(voucher.price)}
                        </div>

                        {finalPoint !== undefined && (
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#64748b",
                                }}
                            >
                                {formatPoint(finalPoint)} Point
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            color: "#2563eb",
                            fontSize: 14,
                            fontWeight: 600,
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.2s ease",
                        }}
                    >
                        Lihat Detail →
                    </div>
                </div>
            </div>
        </Link>
    );
}
