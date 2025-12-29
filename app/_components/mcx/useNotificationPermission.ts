"use client";

import { useSyncExternalStore } from "react";

type Permission = NotificationPermission;

function subscribePermissionChange(_onStoreChange: () => void): () => void {
  // Browser tidak punya event built-in untuk permission change.
  // Untuk demo: kita polling ringan.
  const interval = window.setInterval(_onStoreChange, 500);
  return () => window.clearInterval(interval);
}

function getSnapshot(): Permission {
  return Notification.permission;
}

function getServerSnapshot(): Permission {
  // SSR-safe snapshot
  return "default";
}

export function useNotificationPermission(): Permission {
  return useSyncExternalStore(
    subscribePermissionChange,
    getSnapshot,
    getServerSnapshot
  );
}
