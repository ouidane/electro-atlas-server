"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CITIES = exports.COUNTRIES = exports.ORDER_STATUS = exports.PAYMENT_METHOD = exports.DELIVERY_STATUS = exports.PAYMENT_STATUS = exports.IMAGE_SIZES = exports.platformMap = exports.ROLE = exports.PLATFORMS = void 0;
exports.PLATFORMS = {
    MARKETPLACE: "marketplace",
    VENDOR: "vendor",
};
exports.ROLE = {
    ADMIN: "admin",
    BUYER: "buyer",
    SELLER: "seller",
    SUPPORT: "support",
    DELIVER: "deliver",
};
exports.platformMap = {
    [exports.PLATFORMS.MARKETPLACE]: process.env.MARKETPLACE_URL,
    [exports.PLATFORMS.VENDOR]: process.env.VENDOR_URL,
    server: process.env.SERVER_URL,
};
exports.IMAGE_SIZES = {
    TINY: 200,
    MEDIUM: 400,
    LARGE: 800,
};
exports.PAYMENT_STATUS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
    PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
    CANCELLED: "CANCELLED",
};
exports.DELIVERY_STATUS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    RETURNED: "RETURNED",
    FAILED: "FAILED",
};
exports.PAYMENT_METHOD = {
    CARD: "CARD",
    PAYPAL: "PAYPAL",
    CASH_ON_DELIVERY: "CASH_ON_DELIVERY",
};
exports.ORDER_STATUS = {
    CREATED: "CREATED",
    PROCESSING: "PROCESSING",
    CONFIRMED: "CONFIRMED",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    REFUNDED: "REFUNDED",
    ON_HOLD: "ON_HOLD",
};
exports.COUNTRIES = ["Morocco"];
exports.CITIES = [
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
];
//# sourceMappingURL=constants.js.map