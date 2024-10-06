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
exports.clearCart = exports.deleteItemFromCart = exports.updateItemInCart = exports.addItemToCart = exports.getItemById = exports.getCartById = exports.getCarts = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = require("../models");
const sortHandler_1 = require("../utils/sortHandler");
// Get carts ================================================================
const getCarts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 10, page = 1, minAmount, maxAmount, minTotalProducts, maxTotalProducts, minTotalItems, maxTotalItems, sort = "createdAt", } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    // Build the query object
    const query = {};
    if (minAmount)
        query.amount = Object.assign(Object.assign({}, query.amount), { $gte: Number(minAmount) });
    if (maxAmount)
        query.amount = Object.assign(Object.assign({}, query.amount), { $lte: Number(maxAmount) });
    if (minTotalProducts)
        query.totalProducts = Object.assign(Object.assign({}, query.totalProducts), { $gte: Number(minTotalProducts) });
    if (maxTotalProducts)
        query.totalProducts = Object.assign(Object.assign({}, query.totalProducts), { $lte: Number(maxTotalProducts) });
    if (minTotalItems)
        query.totalItems = Object.assign(Object.assign({}, query.totalItems), { $gte: Number(minTotalItems) });
    if (maxTotalItems)
        query.totalItems = Object.assign(Object.assign({}, query.totalItems), { $lte: Number(maxTotalItems) });
    // Sorting logic
    const AllowedSortFields = {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        amount: "amount",
        totalProducts: "totalProducts",
        totalItems: "totalItems",
    };
    const sortOptions = (0, sortHandler_1.buildSortOption)(sort, AllowedSortFields);
    // Fetch carts with pagination and sorting
    const carts = yield models_1.Cart.find(query)
        .select("userId totalProducts totalItems amount createdAt updatedAt")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .lean();
    if (!carts || carts.length === 0) {
        return next((0, http_errors_1.default)(404, "Carts not found"));
    }
    // Get total count for pagination
    const totalCount = yield models_1.Cart.countDocuments(query);
    res.status(200).json({
        carts,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalCount,
            limit: limitNumber,
        },
    });
});
exports.getCarts = getCarts;
// Get Cart By Id ================================================================
const getCartById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId } = req.params;
    const cart = yield models_1.Cart.findById(cartId).select("-__v").lean();
    if (!cart) {
        return next((0, http_errors_1.default)(404, "Cart not found"));
    }
    const cartItems = yield models_1.CartItem.getFormattedCartItems(cart._id);
    res.status(200).json({ cart: Object.assign(Object.assign({}, cart), { cartItems }) });
});
exports.getCartById = getCartById;
// Get Item By Id ================================================================
const getItemById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, itemId } = req.params;
    const item = yield models_1.CartItem.findOne({ cartId, _id: itemId })
        .select("-__v")
        .lean();
    if (!item) {
        return next((0, http_errors_1.default)(404, "Item not found"));
    }
    res.status(200).json({ item });
});
exports.getItemById = getItemById;
// Add item to cart ================================================================
const addItemToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId } = req.params;
    const { productId, sku, quantity = 1 } = req.body;
    const product = yield models_1.Product.findById(productId).lean();
    if (!product) {
        return next((0, http_errors_1.default)(404, "Product not found"));
    }
    const variant = product.variants.find((variant) => variant.sku === sku);
    if (!variant) {
        return next((0, http_errors_1.default)(404, "Product variant not found"));
    }
    const item = yield models_1.CartItem.findOne({ cartId, productId, sku });
    if (item) {
        item.quantity += quantity;
        yield item.save();
    }
    else {
        yield models_1.CartItem.create({ quantity, cartId, productId, sku });
    }
    yield models_1.Cart.updateCart(cartId);
    res.status(201).json({ message: "Cart item added successfully" });
});
exports.addItemToCart = addItemToCart;
// Update item in cart ================================================================
const updateItemInCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, itemId } = req.params;
    const quantity = Number(req.body.quantity);
    const item = yield models_1.CartItem.findOne({ cartId, _id: itemId });
    if (!item) {
        return next((0, http_errors_1.default)(404, "Item not found"));
    }
    if (quantity === 0) {
        yield models_1.CartItem.findByIdAndDelete(item._id);
    }
    else {
        item.quantity = quantity;
        yield item.save();
    }
    yield models_1.Cart.updateCart(cartId);
    res.status(200).json({ message: "Cart item updated successfully" });
});
exports.updateItemInCart = updateItemInCart;
// Delete item in cart ================================================================
const deleteItemFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, itemId } = req.params;
    const item = yield models_1.CartItem.findOneAndDelete({ cartId, _id: itemId });
    if (!item) {
        return next((0, http_errors_1.default)(404, "Item not found"));
    }
    yield models_1.Cart.updateCart(cartId);
    res.status(200).json({ message: "Cart item deleted successfully" });
});
exports.deleteItemFromCart = deleteItemFromCart;
// Delete all items in cart ================================================================
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId } = req.params;
    yield models_1.CartItem.deleteMany({ cartId });
    yield models_1.Cart.updateCart(cartId);
    res.status(200).json({ message: "Cart is cleared successfully" });
});
exports.clearCart = clearCart;
//# sourceMappingURL=cartController.js.map