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
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.createReview = exports.getReviews = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = require("../models");
const createReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;
    const product = yield models_1.Product.findById(productId);
    if (!product) {
        return next((0, http_errors_1.default)(404, "Product not found"));
    }
    const newReview = new models_1.Review({
        rating,
        comment,
        userId,
        productId,
    });
    yield newReview.save();
    // Update product's review details
    yield models_1.Review.updateProductReview(product._id);
    res.status(201).json({ message: "Review created" });
});
exports.createReview = createReview;
const getReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page) || 10;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const product = yield models_1.Product.findById(productId);
    if (!product) {
        return next((0, http_errors_1.default)(404, "Product not found"));
    }
    const reviews = yield models_1.Review.find({ productId })
        .populate({
        path: "user",
        select: "-_id familyName givenName userId",
        options: { lean: true },
    })
        .select("-__v")
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limitNumber)
        .lean();
    const totalReviews = yield models_1.Review.countDocuments({ productId });
    res.status(200).json({
        reviews,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalReviews / limitNumber),
            totalReviews: totalReviews,
            limit: limitNumber,
        },
    });
});
exports.getReviews = getReviews;
const getReviewById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId, productId } = req.params;
    const review = yield models_1.Review.findOne({ _id: reviewId, productId })
        .populate({
        path: "user",
        select: "-_id name userId",
        options: { lean: true },
    })
        .select("rating comment user productId createdAt updatedAt")
        .lean();
    if (!review) {
        return next((0, http_errors_1.default)(404, "Review not found"));
    }
    res.status(200).json({ review });
});
exports.getReviewById = getReviewById;
const updateReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId, productId } = req.params;
    const { rating, comment } = req.body;
    const review = yield models_1.Review.findOne({ _id: reviewId, productId });
    if (!review) {
        return next((0, http_errors_1.default)(404, "Review not found"));
    }
    review.rating = rating;
    review.comment = comment;
    yield review.save();
    // Update product's review details
    yield models_1.Review.updateProductReview(review.productId);
    res.status(200).json({ message: "Review updated" });
});
exports.updateReview = updateReview;
const deleteReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId, productId } = req.params;
    const review = yield models_1.Review.findOneAndDelete({ _id: reviewId, productId });
    if (!review) {
        return next((0, http_errors_1.default)(404, "Review not found"));
    }
    // Update product's review details
    yield models_1.Review.updateProductReview(review.productId);
    res.status(200).json({ message: "Review deleted" });
});
exports.deleteReview = deleteReview;
//# sourceMappingURL=reviewController.js.map