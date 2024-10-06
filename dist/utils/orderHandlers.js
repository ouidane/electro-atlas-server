"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewOrder = createNewOrder;
exports.createNewDelivery = createNewDelivery;
exports.createNewPayment = createNewPayment;
exports.updateOrderStatus = updateOrderStatus;
const models_1 = require("../models");
const constants_1 = require("./constants");
function createNewPayment(session, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const profile = JSON.parse(session.metadata.profile);
        const payment = yield models_1.Payment.create({
            amountTotal: session.amount_total / 100,
            paymentStatus: status,
            paymentMethod: constants_1.PAYMENT_METHOD.CARD,
            customerId: session.customer,
            userId: profile.userId,
            transactionId: session.payment_intent,
        });
        return payment._id;
    });
}
function createNewDelivery(session, orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const profile = JSON.parse(session.metadata.profile);
        const delivery = yield models_1.Delivery.create({
            orderId,
            deliveryStatus: constants_1.DELIVERY_STATUS.PENDING,
            estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            userId: profile.userId,
            trackingNumber: "ORDER0000000000001",
            carrier: "FedEx",
            shippingAddress: {
                street: profile.address.line1,
                city: profile.address.city,
                country: profile.address.country,
                postalCode: profile.address.postalCode,
            },
        });
        return delivery;
    });
}
function createNewOrder(session, paymentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const profile = JSON.parse(session.metadata.profile);
        const cartId = session.metadata.cartId;
        const cartItems = yield models_1.CartItem.getFormattedCartItems(cartId);
        if (!cartItems || cartItems.length === 0)
            throw new Error("Cart not found");
        const order = yield models_1.Order.create({
            userId: profile.userId,
            paymentId: paymentId,
            totalAmount: session.amount_total / 100,
            orderStatus: constants_1.ORDER_STATUS.CREATED,
        });
        const orderItems = cartItems.map((item) => {
            return {
                productId: item.productId,
                orderId: order._id,
                sellerId: item.sellerId,
                quantity: item.quantity,
                salePrice: item.variant.salePrice,
                totalPrice: item.totalPrice,
                productName: item.productName,
                sku: item.variant.sku,
                image: item.image,
            };
        });
        yield models_1.OrderItem.insertMany(orderItems);
        return Object.assign(Object.assign({}, order), { orderItems });
    });
}
function updateOrderStatus(orderId, newStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield models_1.Order.findByIdAndUpdate(orderId, { orderStatus: newStatus });
        }
        catch (error) {
            throw new Error("Failed to update order status");
        }
    });
}
//# sourceMappingURL=orderHandlers.js.map