"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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
                isMatch: () => window.location.pathname === "/",
                contentZones: [
                    {
                        name: "homepage-voucher-banner",
                        selector: "#homepage-voucher-banner",
                    },
                ]
            },
            {
                name: "voucher_detail",
                action: "View Voucher",
                itemAction: "View Item",
                isMatch: () => /^\/voucher\/[^/]+$/.test(window.location.pathname),
            },
            {
                name: "cart",
                action: "View Cart",
                itemAction: "ViewCart",
                isMatch: () => window.location.pathname === "/cart",
            },
        ],
    } satisfies Parameters<
        NonNullable<Window["Evergage"]>["initSitemap"]
    >[0];
}

export function McpProvider() {
    const initialized = useRef(false);
    const pathname = usePathname();

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
                console.log("✅ MCP initialized & sitemap loaded");
            })
            .catch((err) => {
                console.error("❌ MCP init failed", err);
            });
    }, []);

    /**
     * 🔁 WAJIB untuk Next.js SPA
     */
    useEffect(() => {
        if (!initialized.current) return;

        if (window.Evergage) {
            window.Evergage.reinit();
            console.log("🔁 MCP reinit on route change:", pathname);
        }
    }, [pathname]);

    return (
        <Script
            id="evergage-sdk"
            src="https://cdn.evgnet.com/beacon/partnermii/ultravouchermcp/scripts/evergage.min.js"
            strategy="afterInteractive"
            onLoad={onLoad}
        />
    );
}
