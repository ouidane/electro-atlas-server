import appConfig from "../config/appConfig";

export const PLATFORMS = {
  MARKETPLACE: "marketplace",
  VENDOR: "vendor",
} as const;
export type PlatformValue = (typeof PLATFORMS)[keyof typeof PLATFORMS];

export const ORIGINS = {
  [PLATFORMS.MARKETPLACE]: appConfig.marketplaceUrl,
  [PLATFORMS.VENDOR]: appConfig.vendorUrl,
} as const;

export const ROLE = {
  ADMIN: "admin",
  BUYER: "buyer",
  SELLER: "seller",
  SUPPORT: "support",
  DELIVER: "deliver",
} as const;
export type RoleValue = (typeof ROLE)[keyof typeof ROLE];

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  CANCELLED: "CANCELLED",
} as const;
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const DELIVERY_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
  FAILED: "FAILED",
} as const;
export type DeliveryStatus =
  (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];

export const PAYMENT_METHOD = {
  CARD: "CARD",
  PAYPAL: "PAYPAL",
  CASH_ON_DELIVERY: "CASH_ON_DELIVERY",
} as const;
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const ORDER_STATUS = {
  CREATED: "CREATED",
  PROCESSING: "PROCESSING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  ON_HOLD: "ON_HOLD",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const COUNTRIES = ["Morocco"] as const;

export const CITIES = [
  "Casablanca",
  "Rabat",
  "Fes",
  "Marrakesh",
  "Tangier",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "El Jadida",
  "Beni Mellal",
  "Nador",
  "Khouribga",
  "Essaouira",
  "Larache",
  "Taza",
  "Mohammedia",
  "Settat",
] as const;
