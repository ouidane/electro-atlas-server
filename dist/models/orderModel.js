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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../utils/constants");
const orderItemModel_1 = __importDefault(require("./orderItemModel"));
const OrderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    deliveryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Delivery" },
    paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payment" },
    orderItems: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "OrderItem" }],
    totalAmount: { type: Number, min: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    orderStatus: {
        type: String,
        enum: Object.values(constants_1.ORDER_STATUS),
        default: constants_1.ORDER_STATUS.CREATED,
    },
    notes: { type: String },
}, { timestamps: true });
OrderSchema.statics.updateOrderById = function (orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const order = yield this.findById(orderId)
                .populate({ path: "orderItems", options: { lean: true } })
                .lean();
            if (!order) {
                throw new Error("Order not found");
            }
            const orderItems = yield orderItemModel_1.default.find({ orderId }).lean();
            if (!orderItems || orderItems.length === 0) {
                throw new Error("No order items found for the provided order ID");
            }
            let total = 0;
            for (const item of orderItems) {
                total += item.salePrice * item.quantity;
            }
            total += order.taxAmount + order.shippingAmount - order.discountAmount;
            total = parseFloat(total.toFixed(2));
            yield this.findByIdAndUpdate(orderId, { orderItems, totalAmount: total });
        }
        catch (error) {
            throw new Error("Error updating order");
        }
    });
};
const Order = (0, mongoose_1.model)("Order", OrderSchema);
exports.default = Order;
//# sourceMappingURL=orderModel.js.map