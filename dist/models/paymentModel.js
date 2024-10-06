"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../utils/constants");
const PaymentSchema = new mongoose_1.Schema({
    amountTotal: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(constants_1.PAYMENT_STATUS),
        default: constants_1.PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
        type: String,
        enum: Object.values(constants_1.PAYMENT_METHOD),
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerId: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    refundId: {
        type: String,
    },
}, { timestamps: true });
const Payment = (0, mongoose_1.model)("Payment", PaymentSchema);
exports.default = Payment;
//# sourceMappingURL=paymentModel.js.map