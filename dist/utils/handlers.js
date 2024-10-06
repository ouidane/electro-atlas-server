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
exports.checkStock = checkStock;
exports.updateInventory = updateInventory;
exports.restoreInventory = restoreInventory;
const models_1 = require("../models");
const debug_1 = __importDefault(require("debug"));
const debugLogStripe = (0, debug_1.default)("myapp:Stripe");
function checkStock(formattedItems) {
    return __awaiter(this, void 0, void 0, function* () {
        const productIds = formattedItems.map((item) => item.productId);
        const products = yield models_1.Product.find({ _id: { $in: productIds } }).lean();
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));
        const unavailableItems = [];
        for (const item of formattedItems) {
            const product = productMap.get(item.productId.toString());
            if (!product) {
                unavailableItems.push({
                    productId: item.productId.toString(),
                    sku: item.variant.sku,
                    reason: "Product not found",
                });
                continue;
            }
            const matchingVariant = product.variants.find((v) => v.sku === item.variant.sku);
            if (!matchingVariant) {
                unavailableItems.push({
                    productId: product._id.toString(),
                    sku: item.variant.sku,
                    reason: "Matching variant not found",
                });
            }
            else if (matchingVariant.inventory < item.quantity) {
                unavailableItems.push({
                    productId: product._id.toString(),
                    sku: item.variant.sku,
                    reason: `Insufficient stock (requested: ${item.quantity}, available: ${matchingVariant.inventory})`,
                });
            }
        }
        return {
            isAvailable: unavailableItems.length === 0,
            unavailableItems,
        };
    });
}
function updateInventory(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderItems = yield models_1.OrderItem.find({ orderId });
        for (const item of orderItems) {
            yield models_1.Product.findOneAndUpdate({ _id: item.productId, "variants.sku": item.sku }, { $inc: { "variants.$.inventory": -item.quantity } });
        }
    });
}
function restoreInventory(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderItems = yield models_1.OrderItem.find({ orderId });
        for (const item of orderItems) {
            yield models_1.Product.findOneAndUpdate({ _id: item.productId, "variants.sku": item.sku }, { $inc: { "variants.$.inventory": item.quantity } });
        }
    });
}
//# sourceMappingURL=handlers.js.map