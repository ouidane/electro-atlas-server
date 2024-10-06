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
const cartItemModel_1 = __importDefault(require("./cartItemModel"));
// Create the schema for ShoppingCart
const CartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        default: 0,
    },
    totalProducts: {
        type: Number,
        default: 0,
    },
    totalItems: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
CartSchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cartItemModel_1.default.deleteMany({ cartId: this._id });
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
CartSchema.statics.updateCart = function (cartId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cartItems = yield cartItemModel_1.default.find({ cartId })
                .populate("productId")
                .lean();
            const totalItems = cartItems.length;
            const totalProducts = cartItems.reduce((acc, current) => {
                return acc + current.quantity;
            }, 0);
            const totalPrice = cartItems.reduce((acc, current) => {
                const product = current.productId;
                const variant = product.variants.find((variant) => variant.sku === current.sku);
                const productPrice = variant.salePrice;
                return acc + current.quantity * productPrice;
            }, 0);
            yield this.findByIdAndUpdate(cartId, {
                amount: parseFloat(totalPrice.toFixed(2)),
                totalItems,
                totalProducts,
            });
        }
        catch (error) {
            throw new Error("Error updating cart");
        }
    });
};
const Cart = (0, mongoose_1.model)("Cart", CartSchema);
exports.default = Cart;
//# sourceMappingURL=cartModel.js.map