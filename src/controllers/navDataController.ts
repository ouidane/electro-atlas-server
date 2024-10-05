import { Request, Response, NextFunction } from "express";
import { ParentCategory } from "../models";
import redisClient from "../db/connectRedis";

const getNavData = async (req: Request, res: Response, next: NextFunction) => {
  const cachedData = await redisClient.get("departments");
  if (cachedData) {
    return res.status(200).json({ allDepartments: JSON.parse(cachedData) });
  }

  const allDepartments = await ParentCategory.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "parentCategoryId",
        as: "childCategories",
        pipeline: [{ $sort: { createdAt: 1 } }, { $project: { name: 1 } }],
      },
    },
    { $sort: { createdAt: 1 } },
    { $project: { name: 1, childCategories: 1 } },
  ]);

  await redisClient.set("departments", JSON.stringify(allDepartments));

  res.status(200).json({ allDepartments });
};

export { getNavData };
