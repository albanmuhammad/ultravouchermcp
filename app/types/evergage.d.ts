export {};

/* =========================
 * Item Action
 * ========================= */
type ItemAction =
  | "View Item"
  | "Add To Cart"
  | "Remove From Cart"
  | "Purchase"
  | "ViewCart";

/* =========================
 * User
 * ========================= */
type UserAttributes = Readonly<{
  emailAddress?: string;
}>;

type EvergageUser = Readonly<{
  attributes?: UserAttributes;
}>;

type Cart = Readonly<{
  singleLine?: {
    Product: CatalogItem;
  };
  multiLine?: {
    Product: ReadonlyArray<CatalogItem>;
  };
}>;

/* =========================
 * Catalog Types
 * ========================= */

// Generic catalog item (Product, Voucher, etc.)
type CatalogItem = Readonly<{
  _id?: string;
  orderId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  sku?: { _id: string };
  relatedCatalogObjects?: Record<string, readonly string[]>;
  [key: string]: unknown;
}>;

// Catalog container (Product, Category, etc.)
type Catalog = Readonly<{
  Product?: CatalogItem | ReadonlyArray<CatalogItem>;
  Category?: CatalogItem;
}>;

/* =========================
 * Evergage Event
 * ========================= */
type EvergageEvent = Readonly<{
  action?: string;
  itemAction?: ItemAction;

  /** ❗ Legacy (optional, not recommended) */
  itemType?: string;
  itemId?: string;

  order?: Order;

  /** ✅ Correct MCP way */
  catalog?: Catalog;
  cart?: Cart;

  attributes?: Record<string, unknown>;
  user?: EvergageUser;
}>;

/* =========================
 * Sitemap
 * ========================= */
type PageType = Readonly<{
  name: string;
  action?: string;
  itemAction?: ItemAction;
  contentZones?: ReadonlyArray<ContentZone>;
  isMatch: () => boolean;
}>;

type ContentZone = Readonly<{
  name: string;
  selector: string;
}>;

type SitemapConfig = Readonly<{
  global?: {
    onActionEvent?: (event: EvergageEvent) => EvergageEvent;
  };
  pageTypeDefault?: { name: string };
  pageTypes: ReadonlyArray<PageType>;
}>;

type LineItem = Readonly<{
  _id: string;
  price?: number;
  quantity?: number;
  sku?: { _id: string };
  [key: string]: unknown;
}>;

type Order = Readonly<{
  Product: {
    orderId: string;
    totalValue?: number;
    currency?: string;
    lineItems: ReadonlyArray<LineItem>;
  };
}>;

/* =========================
 * SDK
 * ========================= */
interface EvergageSDK {
  init: (config?: { cookieDomain?: string }) => Promise<void>;
  initSitemap: (config: SitemapConfig) => void;
  reinit: () => void;
  sendEvent: (event: EvergageEvent) => void;
  getUserId: () => string;
}

declare global {
  interface Window {
    Evergage?: EvergageSDK;
  }
}
