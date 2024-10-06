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
exports.recommendedProducts = void 0;
const models_1 = require("../models");
const recommendedProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, limit = "10", excludeProductId } = req.query;
    const baseQuery = {
        "variants.inventory": { $gt: 0 },
    };
    if (categoryId) {
        baseQuery.categoryId = categoryId;
    }
    if (excludeProductId) {
        baseQuery._id = { $ne: excludeProductId };
    }
    const recommendedProducts = yield models_1.Product.aggregate([
        { $unwind: "$variants" },
        { $match: baseQuery },
        {
            $addFields: {
                score: {
                    $add: [
                        { $multiply: ["$popularity", 0.3] },
                        { $multiply: ["$salesCount", 0.2] },
                        { $cond: [{ $eq: ["$isFeatured", true] }, 10, 0] },
                        { $multiply: ["$reviews.averageRating", 1.5] },
                    ],
                },
            },
        },
        { $sort: { score: -1 } },
        { $limit: parseInt(limit) },
        {
            $project: {
                name: 1,
                color: 1,
                isFeatured: 1,
                variant: "$variants",
                reviews: 1,
                image: { $arrayElemAt: ["$images.medium", 0] },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);
    res.status(200).json({ recommendedProducts });
});
exports.recommendedProducts = recommendedProducts;
//# sourceMappingURL=recommendController.js.map