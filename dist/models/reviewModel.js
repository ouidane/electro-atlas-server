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
// Create the schema for Review
const ReviewSchema = new mongoose_1.Schema({
    rating: {
        type: Number,
        validate: {
            validator: (value) => {
                return Number.isInteger(value) && value >= 1 && value <= 5;
            },
            message: "Invalid rating",
        },
        required: [true, "rating is required"],
    },
    comment: {
        type: String,
        required: [true, "comment is required"],
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
// Modify the virtual field definition
ReviewSchema.virtual("user", {
    ref: "Profile",
    localField: "userId",
    foreignField: "userId",
    justOne: true,
});
ReviewSchema.statics.updateProductReview = function (productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const Product = (0, mongoose_1.model)("Product");
        const product = yield Product.findById(productId);
        const Review = this;
        const reviews = yield Review.find({ productId });
        // Calculate total number of reviews and total rating
        const totalReviews = reviews.length;
        let totalRating = 0;
        reviews.forEach((review) => {
            totalRating += review.rating;
        });
        // Update product's review fields
        product.reviews.numOfReviews = totalReviews;
        // Calculate precise average rating
        const preciseAverageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        product.reviews.averageRating = parseFloat(preciseAverageRating.toFixed(2));
        product.reviews.roundedAverage = Math.round(preciseAverageRating);
        yield product.save();
    });
};
const Review = (0, mongoose_1.model)("Review", ReviewSchema);
exports.default = Review;
//# sourceMappingURL=reviewModel.js.map