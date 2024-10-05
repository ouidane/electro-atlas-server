export const PLATFORMS = {
  MARKETPLACE: "marketplace",
  DELIVERY: "delivery",
  VENDOR: "vendor",
} as const;

export const ROLE = {
  ADMIN: "admin",
  BUYER: "buyer",
  SELLER: "seller",
  SUPPORT: "support",
  DELIVER: "deliver",
} as const;

export const platformMap: { [key: string]: string } = {
  [PLATFORMS.MARKETPLACE]: process.env.MARKETPLACE_URL,
  [PLATFORMS.DELIVERY]: process.env.DELIVERY_URL,
  [PLATFORMS.VENDOR]: process.env.VENDOR_URL,
} as const;

export const IMAGE_SIZES = {
  TINY: 200,
  MEDIUM: 400,
  LARGE: 800,
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export const DELIVERY_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
  FAILED: "FAILED",
} as const;

export const PAYMENT_METHOD = {
  CARD: "CARD",
  PAYPAL: "PAYPAL",
  CASH_ON_DELIVERY: "CASH_ON_DELIVERY",
} as const;

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

// Type definitions for TypeScript
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type DeliveryStatus =
  (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
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
