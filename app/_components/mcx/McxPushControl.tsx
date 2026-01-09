"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

// =====================
// Types
// =====================

type PushIdentity = Readonly<{
    UserID: string;
    EmailAddress: string;
}>;

type IdentitySource = "mcp" | "supabase" | "anonymous";

type SupabaseIdentity = Readonly<{
    id: string;
    email: string | null;
}>;

type McxPayload = Readonly<{ data?: PushIdentity }>;

function isNonEmptyString(v: unknown): v is string {
    return typeof v === "string" && v.trim().length > 0;
}


// =====================
// Debug helpers
// =====================

function isDebugEnabled(): boolean {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("MCX_DEBUG") === "1";
}

function safeJson(v: unknown): string {
    try {
        return JSON.stringify(v);
    } catch {
        return String(v);
    }
}

function getMcpUserIdFromCookie(): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";").map((c) => c.trim());

    for (const cookie of cookies) {
        if (!cookie.startsWith("_sfid_")) continue;

        const eq = cookie.indexOf("=");
        if (eq < 0) continue;

        const rawValue = decodeURIComponent(cookie.slice(eq + 1));
        const parsed = parseSfidCookieValue(rawValue);

        // ✅ return ONLY anonymousId
        if (parsed.anonymousId) return parsed.anonymousId;
    }

    return null;
}


function parseSfidCookieValue(raw: string): { anonymousId: string | null; consents: unknown[] | null } {
    const trimmed = raw.trim();

    // Case A: value already plain ID
    if (!trimmed.startsWith("{")) {
        return { anonymousId: trimmed.length > 0 ? trimmed : null, consents: null };
    }

    // Case B: JSON string
    try {
        const parsed: unknown = JSON.parse(trimmed);
        if (typeof parsed !== "object" || parsed === null) {
            return { anonymousId: null, consents: null };
        }

        const obj = parsed as Record<string, unknown>;
        const anonymousId = typeof obj.anonymousId === "string" ? obj.anonymousId.trim() : null;

        const consentsVal = obj.consents;
        const consents = Array.isArray(consentsVal) ? consentsVal : null;

        return { anonymousId: anonymousId && anonymousId.length > 0 ? anonymousId : null, consents };
    } catch {
        return { anonymousId: null, consents: null };
    }
}



function debugLog(label: string, payload: unknown): void {
    if (!isDebugEnabled()) return;
    // eslint-disable-next-line no-console
    console.log(`[MCX DEBUG] ${label}:`, payload, safeJson(payload));
}

function getMcpUserIdSafe(): string | null {
    return getMcpUserIdFromCookie();
}

function buildPushIdentity(params: {
    mcpUserId: string | null;
    supabaseUserId: string | null;
    supabaseEmail: string | null;
}): { identity: PushIdentity | null; source: IdentitySource } {
    const { mcpUserId, supabaseUserId, supabaseEmail } = params;

    // ✅ Preferred: MCP User ID
    if (mcpUserId) {
        console.log('ada nih mcpuseridnya')
        return { identity: { UserID: mcpUserId, EmailAddress: 'test@gmail.com' }, source: "mcp" };
    }

    // Fallback: Supabase identity
    if (supabaseUserId) {
        const subscriberKey = isNonEmptyString(supabaseEmail) ? supabaseEmail.trim() : supabaseUserId;
        return { identity: { UserID: supabaseUserId, EmailAddress: subscriberKey }, source: "supabase" };
    }

    // Anonymous: no explicit identity payload (MCX may generate its own)
    return { identity: null, source: "anonymous" };
}

function toPayload(identity: PushIdentity | null): McxPayload | undefined {
    return identity ? { data: identity } : undefined;
}

// =====================
// Component
// =====================

export function McxPushControls(): React.ReactNode {
    const [isMcpReady, setIsMcpReady] = useState<boolean>(false);
    const [isMcxReady, setIsMcxReady] = useState<boolean>(false);

    const [mcpUserId, setMcpUserId] = useState<string | null>(null);
    const [supabaseIdentity, setSupabaseIdentity] = useState<SupabaseIdentity | null>(null);

    // ---- Read/refresh permission (no SSR mismatch since this is client component)
    const [permission, setPermission] = useState<NotificationPermission>("default");

    // ---- Poll readiness for SDKs + MCP user id
    useEffect(() => {
        setPermission(Notification.permission);

        let cancelled = false;

        const tick = () => {
            if (cancelled) return;

            const mcxReady = typeof window.mcxPush !== "undefined";
            const mcpReady = typeof window.Evergage !== "undefined";

            if (mcxReady !== isMcxReady) setIsMcxReady(mcxReady);
            if (mcpReady !== isMcpReady) setIsMcpReady(mcpReady);

            const id = getMcpUserIdSafe();
            if (id && id !== mcpUserId) {
                setMcpUserId(id);
                debugLog("MCP user id detected", { mcpUserId: id });
            }

            window.setTimeout(tick, 200);
        };

        tick();

        return () => {
            cancelled = true;
        };
        // We intentionally don't include isMcxReady/isMcpReady/mcpUserId to avoid re-creating the polling loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Supabase identity watcher
    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        void supabase.auth.getUser().then(({ data }) => {
            const user = data.user ?? null;
            if (!user) {
                setSupabaseIdentity(null);
                debugLog("Supabase user", { user: null });
                return;
            }

            const identity: SupabaseIdentity = { id: user.id, email: user.email ?? null };
            setSupabaseIdentity(identity);
            debugLog("Supabase user", identity);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            if (!user) {
                setSupabaseIdentity(null);
                debugLog("Supabase auth change", { user: null });
                return;
            }

            const identity: SupabaseIdentity = { id: user.id, email: user.email ?? null };
            setSupabaseIdentity(identity);
            debugLog("Supabase auth change", identity);
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    // ---- Compute identity and source
    const { identity, source } = useMemo(() => {
        return buildPushIdentity({
            mcpUserId,
            supabaseUserId: supabaseIdentity?.id ?? null,
            supabaseEmail: supabaseIdentity?.email ?? null,
        });
    }, [mcpUserId, supabaseIdentity]);

    const payload = useMemo(() => toPayload(identity), [identity]);

    const refreshPermission = useCallback((): void => {
        setPermission(Notification.permission);
    }, []);

    // =====================
    // Actions with debug
    // =====================

    const debugSnapshot = useCallback((): void => {
        const snap = {
            debugEnabled: isDebugEnabled(),
            mcxReady: typeof window.mcxPush !== "undefined",
            mcpReady: typeof window.Evergage !== "undefined",
            mcpUserId,
            supabaseIdentity,
            chosen: { source, identity },
            permission: Notification.permission,
        };
        debugLog("SNAPSHOT", snap);
        // eslint-disable-next-line no-console
        console.log("[MCX DEBUG] SNAPSHOT (pretty):\n", JSON.stringify(snap, null, 2));
    }, [identity, mcpUserId, source, supabaseIdentity]);

    const showNotificationPrompt = useCallback((): void => {
        const mcx = window.mcxPush;
        if (!mcx) return;

        debugLog("showNotificationPrompt payload", { source, identity, payload });
        mcx.showNotificationPrompt(payload);
        refreshPermission();
    }, [identity, payload, refreshPermission, source]);

    const subscribe = useCallback((): void => {
        const mcx = window.mcxPush;
        if (!mcx) return;

        console.log('hehehe', payload)

        debugLog("subscribe payload", { source, identity, payload });
        const res = mcx.subscribe(payload);

        if (res && typeof (res as Promise<unknown>).then === "function") {
            void (res as Promise<unknown>).then(() => refreshPermission());
        } else {
            refreshPermission();
        }
    }, [identity, payload, refreshPermission, source]);

    const initializeAuto = useCallback((): void => {
        const mcx = window.mcxPush;
        if (!mcx) return;

        debugLog("initialize payload", { source, identity, payload });
        mcx.initialize(payload);
        refreshPermission();
    }, [identity, payload, refreshPermission, source]);

    const showInstallPrompt = useCallback((): void => {
        const mcx = window.mcxPush;
        if (!mcx) return;

        debugLog("showPWAInstallPrompt", { ok: true });
        mcx.showPWAInstallPrompt();
    }, []);

    // ---- Option: enforce MCP-only for subscribe (so you don’t accidentally create a different SubscriberKey)
    const mcpOnly = true;
    const canSubscribe = isMcxReady && (!mcpOnly || source === "mcp");

    // const identityText = identity?.SubscriberKey ?? "null";

    return (
        <div
            className="mt-10"
            style={{
                display: "grid",
                gap: 10,
                padding: 12,
                border: "1px solid #e5e5e5",
                borderRadius: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                    <div style={{ fontWeight: 700 }}>MCX Push (Debug)</div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                        MCX Ready: <b>{String(isMcxReady)}</b> • MCP Ready: <b>{String(isMcpReady)}</b> • Permission:{" "}
                        <b>{permission}</b>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                        MCP User ID: <b>{mcpUserId ?? "null"}</b>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                        Supabase: <b>{supabaseIdentity ? `${supabaseIdentity.email ?? "no-email"} (${supabaseIdentity.id})` : "null"}</b>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>

                    </div>
                </div>

                <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                    <button
                        type="button"
                        onClick={() => {
                            window.localStorage.setItem("MCX_DEBUG", "1");
                            debugSnapshot();
                        }}
                    >
                        Enable Debug
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            window.localStorage.removeItem("MCX_DEBUG");
                            // eslint-disable-next-line no-console
                            console.log("[MCX DEBUG] Disabled");
                        }}
                    >
                        Disable Debug
                    </button>
                    <button type="button" onClick={debugSnapshot}>
                        Snapshot
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={showNotificationPrompt} disabled={!isMcxReady}>
                    showNotificationPrompt()
                </button>

                <button type="button" onClick={subscribe} disabled={!canSubscribe} title={mcpOnly ? "MCP-only enabled: waits for MCP User ID" : ""}>
                    subscribe()
                </button>

                <button type="button" onClick={initializeAuto} disabled={!isMcxReady} title={mcpOnly ? "MCP-only enabled: waits for MCP User ID" : ""}>
                    initialize()
                </button>

                <button type="button" onClick={showInstallPrompt} disabled={!isMcxReady}>
                    showPWAInstallPrompt()
                </button>

                <button type="button" onClick={refreshPermission}>
                    refresh permission
                </button>
            </div>

            <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
                <div>
                    Debug toggle:
                    <code style={{ marginLeft: 6 }}>
                        {`localStorage.setItem("MCX_DEBUG","1")`}
                    </code>

                </div>
                <div>
                    MCP-only mode is <b>{String(mcpOnly)}</b>. If subscribe is disabled, wait until MCP User ID is not null.
                </div>
            </div>
        </div>
    );
}
