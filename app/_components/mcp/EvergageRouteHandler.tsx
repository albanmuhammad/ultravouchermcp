// app/_components/EvergageRouteHandler.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function EvergageRouteHandler() {
    const pathname = usePathname();

    useEffect(() => {
        // Trigger Evergage reinit saat route berubah
        if (typeof window !== "undefined" && window.Evergage) {
            console.log("Route changed to:", pathname);

            // Reinit Evergage untuk detect page type baru
            window.Evergage.reinit();
        }
    }, [pathname]);

    return null;
}