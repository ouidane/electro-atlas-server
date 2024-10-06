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
exports.bestOffers = void 0;
const models_1 = require("../models");
// Best Offers
const bestOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parentCategories = yield models_1.ParentCategory.find().sort("name").lean();
    const categoriesWithBestOffers = yield Promise.all(parentCategories.map((parentCategory) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield models_1.Product.aggregate([
            { $unwind: "$variants" },
            {
                $match: {
                    parentCategoryId: parentCategory._id,
                    "variants.discountPercent": { $gt: 0 },
                },
            },
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
            { $sort: { discountPercent: -1 } },
            { $limit: 10 },
        ]);
        return { parentCategory, products };
    })));
    res.status(200).json({ categoriesWithBestOffers });
});
exports.bestOffers = bestOffers;
//# sourceMappingURL=bestOffersController.js.map