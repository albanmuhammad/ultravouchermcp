export class WidgetUnauthorizedError extends Error {
  constructor() {
    super("UltraVoucher widget token expired or invalid");
    this.name = "WidgetUnauthorizedError";
  }
}
