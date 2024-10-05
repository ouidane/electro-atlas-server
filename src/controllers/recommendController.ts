import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Product } from "../models";

const recommendedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { categoryId, limit = "10", excludeProductId } = req.query;

  const baseQuery: any = {
    "variants.inventory": { $gt: 0 },
  };

  if (categoryId) {
    baseQuery.categoryId = categoryId;
  }

  if (excludeProductId) {
    baseQuery._id = { $ne: excludeProductId };
  }

  const recommendedProducts = await Product.aggregate([
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
    { $limit: parseInt(limit as string) },
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
};

export { recommendedProducts };
