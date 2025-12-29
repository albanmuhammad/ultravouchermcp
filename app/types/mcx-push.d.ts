export {};

declare global {
  interface Window {
    mcxPush?: Readonly<{
      showNotificationPrompt: (
        args?: Readonly<{ data?: Readonly<Record<string, unknown>> }>
      ) => void;
      subscribe: (
        args?: Readonly<{ data?: Readonly<Record<string, unknown>> }>
      ) => Promise<unknown> | void;
      showPWAInstallPrompt: () => void;
      initialize: (
        args?: Readonly<{ data?: Readonly<Record<string, unknown>> }>
      ) => void;
    }>;
  }
}
