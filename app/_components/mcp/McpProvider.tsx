"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

function buildSitemapConfig() {
    return {
        global: {
            onActionEvent: (event) => {
                const email = localStorage.getItem("user_email");

                if (email) {
                    return {
                        ...event,
                        user: {
                            attributes: {
                                emailAddress: email,
                            },
                        },
                    };
                }

                return event;
            },
        },

        pageTypeDefault: {
            name: "default",
        },

        pageTypes: [
            {
                name: "home",
                action: "Homepage View",
                isMatch: async () => window.location.pathname === "/",
            },
            {
                name: "voucher_detail",
                action: "View Voucher",
                itemAction: "View Item",
                isMatch: async () =>
                    /^\/voucher\/[^/]+$/.test(window.location.pathname),
            },
            {
                name: "cart",
                action: "View Cart",
                itemAction: "ViewCart",
                isMatch: async () => window.location.pathname === "/cart",
            },
        ],
    } satisfies Parameters<
        NonNullable<Window["Evergage"]>["initSitemap"]
    >[0];
}

export function McpProvider() {
    const initialized = useRef(false);

    const onLoad = useCallback(() => {
        if (initialized.current) return;
        initialized.current = true;

        const sdk = window.Evergage;
        if (!sdk) {
            console.error("❌ MCP: Evergage SDK missing");
            return;
        }

        sdk
            .init({ cookieDomain: window.location.hostname })
            .then(() => {
                sdk.initSitemap(buildSitemapConfig());
                console.log("✅ MCP initialized (TS safe)");
            })
            .catch((err: unknown) => {
                console.error("❌ MCP init failed", err);
            });
    }, []);

    return (
        <Script
            id="evergage-sdk"
            src="https://cdn.evgnet.com/beacon/partnermii/ultravouchermcp/scripts/evergage.min.js"
            strategy="afterInteractive"
            onLoad={onLoad}
        />
    );
}
