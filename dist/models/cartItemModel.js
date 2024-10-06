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
// Create the schema for Cart
const CartItemSchema = new mongoose_1.Schema({
    quantity: {
        type: Number,
        required: [true, "quantity is required"],
    },
    cartId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
    },
}, { timestamps: true });
// Define the static method for formattedCartItems
CartItemSchema.statics.getFormattedCartItems = function (cartId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (typeof cartId === "string") {
                cartId = new mongoose_1.Types.ObjectId(cartId);
            }
            const cartItems = yield this.aggregate([
                { $match: { cartId } },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $unwind: "$product" },
                {
                    $addFields: {
                        matchedVariant: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$product.variants",
                                        as: "variant",
                                        cond: { $eq: ["$$variant.sku", "$sku"] },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        itemId: "$_id",
                        quantity: 1,
                        productId: 1,
                        productName: "$product.name",
                        totalPrice: {
                            $round: [
                                {
                                    $multiply: [
                                        "$quantity",
                                        {
                                            $ifNull: [
                                                "$matchedVariant.salePrice",
                                                "$matchedVariant.globalPrice",
                                            ],
                                        },
                                    ],
                                },
                                2
                            ],
                        },
                        image: { $arrayElemAt: ["$product.images.tiny", 0] },
                        sellerId: "$product.sellerId",
                        variant: "$matchedVariant",
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ]);
            return cartItems;
        }
        catch (error) {
            throw new Error(`Error fetching formatted cart items: ${error.message}`);
        }
    });
};
// Create the Cart model
const CartItem = (0, mongoose_1.model)("CartItem", CartItemSchema);
exports.default = CartItem;
//# sourceMappingURL=cartItemModel.js.map