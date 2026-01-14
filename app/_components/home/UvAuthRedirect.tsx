"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Props = {
    reason: "uv_token_required" | "uv_session_expired" | "session_expired";
};

export function UvAuthRedirect({ reason }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only redirect if NOT already on login page to avoid infinite loop
        if (!pathname.includes("/login")) {
            router.replace(`/login?reason=${reason}`);
        }
    }, [router, pathname, reason]);

    // Show loading state while redirecting
    return (
        <main style={{
            minHeight: "100vh",
            background: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                textAlign: "center",
                padding: "40px"
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: "4px solid #e5e7eb",
                    borderTopColor: "#3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px"
                }} />
                <p style={{
                    fontSize: 16,
                    color: "#6b7280",
                    fontWeight: 500
                }}>
                    Redirecting to login...
                </p>
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </main>
    );
}