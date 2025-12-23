"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
    const handleLogout = async () => {
        await logoutAction();
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "1px solid #e5e5e5",
                color: "#666",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fee";
                e.currentTarget.style.borderColor = "#fcc";
                e.currentTarget.style.color = "#c33";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "#e5e5e5";
                e.currentTarget.style.color = "#666";
            }}
        >
            <LogOut size={16} />
            Logout
        </button>
    );
}