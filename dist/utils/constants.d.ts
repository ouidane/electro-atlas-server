export declare const PLATFORMS: {
    readonly MARKETPLACE: "marketplace";
    readonly DELIVERY: "delivery";
    readonly VENDOR: "vendor";
};
export declare const ROLE: {
    readonly ADMIN: "admin";
    readonly BUYER: "buyer";
    readonly SELLER: "seller";
    readonly SUPPORT: "support";
    readonly DELIVER: "deliver";
};
export declare const platformMap: {
    [key: string]: string;
};
export declare const IMAGE_SIZES: {
    readonly TINY: 200;
    readonly MEDIUM: 400;
    readonly LARGE: 800;
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "PENDING";
    readonly PROCESSING: "PROCESSING";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly REFUNDED: "REFUNDED";
    readonly PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED";
    readonly CANCELLED: "CANCELLED";
};
export declare const DELIVERY_STATUS: {
    readonly PENDING: "PENDING";
    readonly PROCESSING: "PROCESSING";
    readonly SHIPPED: "SHIPPED";
    readonly IN_TRANSIT: "IN_TRANSIT";
    readonly DELIVERED: "DELIVERED";
    readonly RETURNED: "RETURNED";
    readonly FAILED: "FAILED";
};
export declare const PAYMENT_METHOD: {
    readonly CARD: "CARD";
    readonly PAYPAL: "PAYPAL";
    readonly CASH_ON_DELIVERY: "CASH_ON_DELIVERY";
};
export declare const ORDER_STATUS: {
    readonly CREATED: "CREATED";
    readonly PROCESSING: "PROCESSING";
    readonly CONFIRMED: "CONFIRMED";
    readonly SHIPPED: "SHIPPED";
    readonly DELIVERED: "DELIVERED";
    readonly CANCELLED: "CANCELLED";
    readonly REFUNDED: "REFUNDED";
    readonly ON_HOLD: "ON_HOLD";
};
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type DeliveryStatus = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export declare const COUNTRIES: readonly ["Morocco"];
export declare const CITIES: readonly ["Casablanca", "Rabat", "Fes", "Marrakesh", "Tangier", "Agadir", "Meknes", "Oujda", "Kenitra", "Tetouan", "Safi", "El Jadida", "Beni Mellal", "Nador", "Khouribga", "Essaouira", "Larache", "Taza", "Mohammedia", "Settat"];
