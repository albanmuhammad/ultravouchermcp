"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";
import { useNotificationPermission } from "@/app/_components/mcx/useNotificationPermission";

type PushIdentity = Readonly<{
    ID: string;
    SubscriberKey: string;
}>;

function isNonEmptyString(v: unknown): v is string {
    return typeof v === "string" && v.trim().length > 0;
}

function getIdentityPayload(identity: PushIdentity | null): Readonly<{ data?: PushIdentity }> {
    return identity ? { data: identity } : {};
}

export function McxPushControls(): React.ReactNode {
    const [isReady, setIsReady] = useState<boolean>(false);
    const [identity, setIdentity] = useState<PushIdentity | null>(null);

    const permission = useNotificationPermission();

    useEffect(() => {
        let cancelled = false;

        const tick = () => {
            if (cancelled) return;
            if (window.mcxPush) {
                setIsReady(true);
                return;
            }
            window.setTimeout(tick, 200);
        };

        tick();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        void supabase.auth.getUser().then(({ data }) => {
            const user = data.user;
            if (!user) {
                setIdentity(null);
                return;
            }
            const email = user.email;
            const subscriberKey = isNonEmptyString(email) ? email : user.id;
            setIdentity({ ID: user.id, SubscriberKey: subscriberKey });
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            if (!user) {
                setIdentity(null);
                return;
            }
            const email = user.email;
            const subscriberKey = isNonEmptyString(email) ? email : user.id;
            setIdentity({ ID: user.id, SubscriberKey: subscriberKey });
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    const showNotificationPrompt = useCallback((): void => {
        const mcx = window.mcxPush;
        if (!mcx) return;
        mcx.showNotificationPrompt(getIdentityPayload(identity));
    }, [identity]);

    const subscribe = useCallback((): void => {
        const mcx = window.mcxPush;
        if (!mcx) return;
        void mcx.subscribe(getIdentityPayload(identity));
    }, [identity]);

    const showInstallPrompt = useCallback((): void => {
        window.mcxPush?.showPWAInstallPrompt();
    }, []);

    const initializeAuto = useCallback((): void => {
        window.mcxPush?.initialize(getIdentityPayload(identity));
    }, [identity]);

    const identityText = useMemo(() => (identity ? identity.SubscriberKey : "Anonymous"), [identity]);

    return (
        <div className="mt-10" style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #e5e5e5", borderRadius: 12 }}>
            <div>
                <div style={{ fontWeight: 700 }}>MCX Push</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                    Ready: <b>{String(isReady)}</b> • Permission: <b>{permission}</b> • Identity: <b>{identityText}</b>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={showNotificationPrompt} disabled={!isReady}>
                    showNotificationPrompt()
                </button>
                <button type="button" onClick={subscribe} disabled={!isReady}>
                    subscribe()
                </button>
                <button type="button" onClick={showInstallPrompt} disabled={!isReady}>
                    showPWAInstallPrompt()
                </button>
                <button type="button" onClick={initializeAuto} disabled={!isReady}>
                    initialize()
                </button>
            </div>
        </div>
    );
}
