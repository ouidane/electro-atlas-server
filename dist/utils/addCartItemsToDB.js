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
exports.addCartItemsToDatabase = void 0;
const models_1 = require("../models");
// Add items to database when user registered
const addCartItemsToDatabase = (cartItems, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield models_1.Cart.create({ userId });
    if (!cartItems || cartItems.length === 0) {
        return;
    }
    for (const item of cartItems) {
        const product = yield models_1.Product.findById(item.productId);
        if (!product || item.quantity <= 0) {
            continue; // Skip this item and proceed to the next
        }
        yield models_1.CartItem.create({
            quantity: item.quantity,
            productId: item.productId,
            cartId: cart._id,
        });
    }
    yield models_1.Cart.updateCart(cart._id);
});
exports.addCartItemsToDatabase = addCartItemsToDatabase;
//# sourceMappingURL=addCartItemsToDB.js.map