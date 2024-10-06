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
exports.bestSeller = void 0;
const models_1 = require("../models");
// Best Seller
const bestSeller = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parentCategories = yield models_1.ParentCategory.find().lean();
    const categoriesWithBestSellers = yield Promise.all(parentCategories.map((parentCategory) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield models_1.OrderItem.aggregate([
            { $group: { _id: "$productId", numOfOrders: { $sum: 1 } } },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $match: { "product.parentCategoryId": parentCategory._id } },
            { $unwind: "$product.variants" },
            { $sort: { numOfOrders: -1 } },
            { $limit: 10 },
            {
                $project: {
                    name: "$product.name",
                    color: "$product.color",
                    isFeatured: "$product.isFeatured",
                    variant: "$product.variants",
                    reviews: "$product.reviews",
                    image: { $arrayElemAt: ["$product.images.medium", 0] },
                    createdAt: "$product.createdAt",
                    updatedAt: "$product.updatedAt",
                },
            },
        ]);
        return {
            parentCategory: { _id: parentCategory._id, name: parentCategory.name },
            products,
        };
    })));
    res.status(200).json({ categoriesWithBestSellers });
});
exports.bestSeller = bestSeller;
//# sourceMappingURL=bestSellerController.js.map