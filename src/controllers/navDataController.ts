import { Request, Response, NextFunction } from "express";
import { ParentCategory } from "../models";

const getNavData = async (req: Request, res: Response, next: NextFunction) => {
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

  res.status(200).json({ allDepartments });
};

export { getNavData };
