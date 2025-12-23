import type React from "react";
import Link from "next/link";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export async function Navbar(): Promise<React.ReactNode> {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    return (
        <header style={{
            background: "white",
            borderBottom: "1px solid #e5e5e5",
            position: "sticky",
            top: 0,
            zIndex: 50,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
            <nav
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {/* Logo/Brand */}
                <Link
                    href="/"
                    style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#2563eb",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    🎫 UltraVoucher
                </Link>

                {/* Navigation Links */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                }}>
                    <Link
                        href="/"
                        style={{
                            color: "#333",
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: 15,
                            transition: "color 0.2s ease",
                        }}
                    >
                        Vouchers
                    </Link>

                    <Link
                        href="/cart"
                        style={{
                            color: "#333",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 500,
                            fontSize: 15,
                            transition: "color 0.2s ease",
                        }}
                    >
                        <ShoppingCart size={18} />
                        Cart
                    </Link>

                    {/* Auth Section */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        paddingLeft: 16,
                        borderLeft: "1px solid #e5e5e5",
                    }}>
                        {user ? (
                            <>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    color: "#666",
                                    fontSize: 14,
                                }}>
                                    <User size={16} />
                                    <span style={{
                                        maxWidth: 150,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {user.email}
                                    </span>
                                </div>
                                <LogoutButton />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    style={{
                                        color: "#333",
                                        textDecoration: "none",
                                        fontWeight: 500,
                                        fontSize: 15,
                                        transition: "color 0.2s ease",
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    style={{
                                        background: "#2563eb",
                                        color: "white",
                                        textDecoration: "none",
                                        padding: "8px 20px",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        fontSize: 14,
                                        transition: "background 0.2s ease",
                                    }}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}