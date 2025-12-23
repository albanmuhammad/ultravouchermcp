"use client";

import { useState } from "react";
import Link from "next/link";
import type { Voucher } from "@/app/page";

type VoucherCardProps = {
    voucher: Voucher;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function VoucherCard({ voucher }: VoucherCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={`/voucher/${encodeURIComponent(voucher.id)}`}
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
                display: "block"
            }}
        >
            <div style={{
                position: "relative",
                overflow: "hidden",
                height: 160,
                background: "#f5f5f5"
            }}>
                <img
                    src={voucher.imageUrl}
                    alt={voucher.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        transform: isHovered ? "scale(1.1)" : "scale(1)"
                    }}
                />

                <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "white",
                    color: "#333",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    {voucher.merchant}
                </div>
            </div>

            <div style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8
            }}>
                <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    margin: 0,
                    color: "#1a1a1a",
                    lineHeight: 1.4
                }}>
                    {voucher.name}
                </h3>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4
                }}>
                    <div style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#2563eb"
                    }}>
                        {formatRupiah(voucher.price)}
                    </div>

                    <div style={{
                        color: "#2563eb",
                        fontSize: 14,
                        fontWeight: 600,
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 0.2s ease"
                    }}>
                        Beli →
                    </div>
                </div>
            </div>
        </Link>
    );
}