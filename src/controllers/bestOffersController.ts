import { Request, Response, NextFunction } from "express";
import { Product, ParentCategory } from "../models";

// Best Offers
const bestOffers = async (req: Request, res: Response, next: NextFunction) => {
  const parentCategories = await ParentCategory.find().sort("name").lean();

  const categoriesWithBestOffers = await Promise.all(
    parentCategories.map(async (parentCategory) => {
      const products = await Product.aggregate([
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
    })
  );

  res.status(200).json({ categoriesWithBestOffers });
};

export { bestOffers };
