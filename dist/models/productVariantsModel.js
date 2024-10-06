"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantsSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ProductVariantsSchema = new mongoose_1.Schema({
    variation: {
        type: String,
        required: [true, "variation is required"],
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
    },
    inventory: {
        type: Number,
        required: [true, "inventory is required"],
        min: [0, "inventory must be a positive number"],
    },
    globalPrice: {
        type: Number,
        required: [true, "globalPrice is required"],
        min: [0, "globalPrice must be a positive number"],
    },
    salePrice: {
        type: Number,
        min: [0, "salePrice must be a positive number"],
    },
    discountPercent: {
        type: Number,
        default: 0
    },
    saleStartDate: {
        type: Date,
        default: Date.now
    },
    saleEndDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return !this.saleStartDate || value > this.saleStartDate;
            },
            message: "saleEndDate must be after saleStartDate",
        },
    },
});
//# sourceMappingURL=productVariantsModel.js.map