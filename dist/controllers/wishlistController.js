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
exports.deleteItemFromWishlist = exports.addItemToWishlist = exports.getWishlistById = exports.getWishlists = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = require("../models");
// Get wishlists ================================================================
const getWishlists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const wishlists = yield models_1.Wishlist.find({ userId })
        .populate({
        path: "items.product",
        select: "_id name images variants",
    })
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limitNumber)
        .lean();
    const totalCount = yield models_1.Wishlist.countDocuments({ userId });
    const formattedWishlists = wishlists.map((wishlist) => ({
        userId: wishlist.userId,
        itemsCount: wishlist.items.length,
        items: wishlist.items.map((item) => {
            var _a;
            const variant = item.product.variants.find((v) => v.sku === item.sku);
            return {
                productId: item.product._id,
                productName: item.product.name,
                globalPrice: variant === null || variant === void 0 ? void 0 : variant.globalPrice,
                salePrice: variant === null || variant === void 0 ? void 0 : variant.salePrice,
                sku: item.sku,
                image: (_a = item.product.images[0]) === null || _a === void 0 ? void 0 : _a.tiny,
                sellerId: item.product.sellerId,
                variation: variant.variation,
            };
        }),
    }));
    res.status(200).json({
        wishlists: formattedWishlists,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalCount,
            limit: limitNumber,
        },
    });
});
exports.getWishlists = getWishlists;
// Get Wishlist By Id ================================================================
const getWishlistById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { wishlistId } = req.params;
    const wishlist = yield models_1.Wishlist.findById(wishlistId)
        .populate({
        path: "items.product",
        select: "_id name images variants",
    })
        .lean();
    if (!wishlist) {
        return next((0, http_errors_1.default)(404, "Wishlist not found"));
    }
    const formattedItems = wishlist.items.map((item) => {
        var _a;
        const variant = item.product.variants.find((v) => v.sku === item.sku);
        return {
            wishlistId: wishlistId,
            productId: item.product._id,
            productName: item.product.name,
            image: (_a = item.product.images[0]) === null || _a === void 0 ? void 0 : _a.tiny,
            sellerId: item.product.sellerId,
            variant: variant,
        };
    });
    res.status(200).json({
        wishlist: {
            wishlistId: wishlist._id,
            userId: wishlist.userId,
            itemsCount: wishlist.items.length,
            items: formattedItems,
        },
    });
});
exports.getWishlistById = getWishlistById;
// Add item to wishlist ================================================================
const addItemToWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { wishlistId } = req.params;
    const { productId, sku } = req.body;
    const product = yield models_1.Product.findById(productId);
    if (!product) {
        return next((0, http_errors_1.default)(404, "Product not found"));
    }
    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
        return next((0, http_errors_1.default)(404, "Product variant not found"));
    }
    const wishlist = yield models_1.Wishlist.findById(wishlistId);
    if (!wishlist) {
        return next((0, http_errors_1.default)(404, "Wishlist not found"));
    }
    if (wishlist.items.some((item) => item.sku === sku)) {
        return next((0, http_errors_1.default)(409, "Product variant already in wishlist"));
    }
    wishlist.items.push({
        product: product._id,
        sku: sku,
    });
    yield wishlist.save();
    res.status(201).json({ message: "Item added to wishlist successfully" });
});
exports.addItemToWishlist = addItemToWishlist;
// Delete item from wishlist =============================================
const deleteItemFromWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { wishlistId } = req.params;
    const { productId, sku } = req.body;
    const wishlist = yield models_1.Wishlist.findById(wishlistId);
    if (!wishlist) {
        return next((0, http_errors_1.default)(404, "Wishlist not found"));
    }
    const itemIndex = wishlist.items.findIndex((item) => item.sku === sku && item.product.toString() === productId);
    if (itemIndex === -1) {
        return next((0, http_errors_1.default)(404, "Item not found in wishlist"));
    }
    wishlist.items.splice(itemIndex, 1);
    yield wishlist.save();
    res.status(200).json({ message: "Item deleted from wishlist successfully" });
});
exports.deleteItemFromWishlist = deleteItemFromWishlist;
//# sourceMappingURL=wishlistController.js.map