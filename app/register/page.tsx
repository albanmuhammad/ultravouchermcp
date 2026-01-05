import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
    title: "Register - UltraVoucher",
};

export default function RegisterPage() {
    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#f8f9fa",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    maxWidth: 480,
                    margin: "0 auto",
                    background: "white",
                    padding: 32,
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
            >
                <h1
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        marginBottom: 8,
                    }}
                >
                    Create Account
                </h1>

                <p
                    style={{
                        fontSize: 14,
                        color: "#666",
                        marginBottom: 24,
                    }}
                >
                    Daftar untuk mulai menukar voucher
                </p>

                <RegisterForm />
            </div>
        </main>
    );
}
