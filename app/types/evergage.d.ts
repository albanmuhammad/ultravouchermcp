export {};

type SitemapConfig = Readonly<{
  global: Record<string, unknown>;
  pageTypes: ReadonlyArray<Readonly<Record<string, unknown>>>;
}>;

declare global {
  interface Window {
    Evergage?: Readonly<{
      init: (config?: Record<string, unknown>) => Promise<void>;
      initSitemap: (config: SitemapConfig) => void;

      // ✅ tambahan untuk subscriberKey dari MCP
      getUserId: () => string;
    }>;
  }
}
