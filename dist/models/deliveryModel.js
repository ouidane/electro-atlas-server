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
const constants_1 = require("../utils/constants");
const DeliverySchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deliveryStatus: {
        type: String,
        enum: Object.values(constants_1.DELIVERY_STATUS),
        default: constants_1.DELIVERY_STATUS.PENDING,
    },
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    // signatureRequired: { type: Boolean, default: false },
    deliveryInstructions: { type: String },
    trackingHistory: [
        {
            status: {
                type: String,
                enum: Object.values(constants_1.DELIVERY_STATUS),
                required: true,
            },
            location: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            description: { type: String },
        },
    ],
}, { timestamps: true });
DeliverySchema.statics.updateDeliveryStatus = function (deliveryId, newStatus, location, description) {
    return __awaiter(this, void 0, void 0, function* () {
        const delivery = yield this.findById(deliveryId);
        if (!delivery) {
            throw new Error("Delivery not found");
        }
        delivery.deliveryStatus = newStatus;
        delivery.trackingHistory.push({
            status: newStatus,
            location,
            timestamp: new Date(),
            description,
        });
        if (newStatus === constants_1.DELIVERY_STATUS.DELIVERED) {
            delivery.actualDeliveryDate = new Date();
        }
        yield delivery.save();
        return delivery;
    });
};
DeliverySchema.statics.updateTrackingInfo = function (deliveryId, trackingNumber, carrier) {
    return __awaiter(this, void 0, void 0, function* () {
        const delivery = yield this.findByIdAndUpdate(deliveryId, { trackingNumber, carrier }, { new: true });
        if (!delivery) {
            throw new Error("Delivery not found");
        }
        return delivery;
    });
};
const Delivery = (0, mongoose_1.model)("Delivery", DeliverySchema);
exports.default = Delivery;
//# sourceMappingURL=deliveryModel.js.map