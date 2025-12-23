"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

type SitemapConfig = Readonly<{
    global: Record<string, unknown>;
    pageTypes: ReadonlyArray<Record<string, unknown>>;
}>;

type EvergageSDK = Readonly<{
    init: (config?: Record<string, unknown>) => Promise<void>;
    initSitemap: (config: SitemapConfig) => void;
}>;

declare global {
    interface Window {
        Evergage?: EvergageSDK;
    }
}

function buildSitemapConfig(): SitemapConfig {
    return {
        global: {},
        pageTypes: [],
    };
}

export function McpProvider() {
    const initializedRef = useRef<boolean>(false);

    const handleLoaded = useCallback((): void => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const sdk = window.Evergage;
        if (!sdk) {
            // Script "onLoad" terpanggil tapi Evergage tidak ada -> berarti script gagal execute / beda konten / blocked
            console.error("❌ MCP: Script loaded, but window.Evergage is still undefined.");
            return;
        }

        void sdk
            .init({ cookieDomain: window.location.hostname })
            .then(() => {
                sdk.initSitemap(buildSitemapConfig());
                console.log("✅ MCP initialized + sitemap loaded");
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : "Unknown MCP init error";
                console.error("❌ MCP init failed:", message);
            });
    }, []);

    const handleError = useCallback((): void => {
        console.error("❌ MCP: Failed to load evergage.min.js (network/CSP/adblock).");
    }, []);

    return (
        <Script
            id="evergage-sdk"
            src="https://cdn.evgnet.com/beacon/partnermii/ultravouchermcp/scripts/evergage.min.js"
            strategy="afterInteractive"
            onLoad={handleLoaded}
            onError={handleError}
        />
    );
}
