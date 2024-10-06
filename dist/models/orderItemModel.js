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
const mongoose_1 = require("mongoose");
const OrderItemSchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    salePrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    isRefunded: { type: Boolean, default: false },
    refundedQuantity: { type: Number, default: 0, min: 0 },
    notes: { type: String },
}, { timestamps: true });
OrderItemSchema.statics.calculateTotal = function (orderItemId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orderItem = yield this.findById(orderItemId);
            if (!orderItem) {
                throw new Error("Order item not found");
            }
            const total = orderItem.salePrice * (orderItem.quantity - orderItem.refundedQuantity);
            const totalPrice = parseFloat(total.toFixed(2));
            yield this.findByIdAndUpdate(orderItemId, { totalPrice });
            return total;
        }
        catch (error) {
            throw new Error("Error calculating total for order item");
        }
    });
};
OrderItemSchema.statics.updateRefundStatus = function (orderItemId, refundedQuantity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orderItem = yield this.findById(orderItemId);
            if (!orderItem) {
                throw new Error("Order item not found");
            }
            if (refundedQuantity > orderItem.quantity) {
                throw new Error("Refunded quantity cannot exceed original quantity");
            }
            const newRefundedQuantity = orderItem.refundedQuantity + refundedQuantity;
            const isFullyRefunded = newRefundedQuantity === orderItem.quantity;
            yield this.findByIdAndUpdate(orderItemId, {
                refundedQuantity: newRefundedQuantity,
                isRefunded: isFullyRefunded,
            });
            yield this.calculateTotal(orderItemId);
        }
        catch (error) {
            throw new Error("Error updating refund status for order item");
        }
    });
};
const OrderItem = (0, mongoose_1.model)("OrderItem", OrderItemSchema);
exports.default = OrderItem;
//# sourceMappingURL=orderItemModel.js.map