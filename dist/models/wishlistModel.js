"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Create the schema for WishlistItem
const WishlistItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sku: {
        type: String,
        required: true,
    },
});
// Create the schema for Wishlist
const WishlistSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [WishlistItemSchema],
}, { timestamps: true });
// Create the Wishlist model
const Wishlist = (0, mongoose_1.model)("Wishlist", WishlistSchema);
exports.default = Wishlist;
//# sourceMappingURL=wishlistModel.js.map