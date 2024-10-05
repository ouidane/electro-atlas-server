import { Request, Response, NextFunction } from "express";
import { OrderItem, ParentCategory } from "../models";

// Best Seller
const bestSeller = async (req: Request, res: Response, next: NextFunction) => {
  const parentCategories = await ParentCategory.find().lean();

  const categoriesWithBestSellers = await Promise.all(
    parentCategories.map(async (parentCategory) => {
      const products = await OrderItem.aggregate([
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
        parentCategory: {_id: parentCategory._id, name: parentCategory.name},
        products,
      };
    })
  );

  res.status(200).json({ categoriesWithBestSellers });
};

export { bestSeller };
