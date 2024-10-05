import { Request, Response, NextFunction } from "express";
import { Product } from "../models";
import createError from "http-errors";
import { Types } from "mongoose";
// import redisClient from "../db/connectRedis";

const productFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parentCategoryId, categoryId } = req.query;

  if (!parentCategoryId) {
    return next(createError(400, "parentCategoryId is required"));
  }

  const matchStage = {
    $match: {
      parentCategoryId: new Types.ObjectId(parentCategoryId as string),
      ...(categoryId
        ? { categoryId: new Types.ObjectId(categoryId as string) }
        : {}),
    },
  };

  const result = await Product.aggregate([
    matchStage,
    { $unwind: "$variants" },
    {
      $facet: {
        priceRange: [
          {
            $group: {
              _id: null,
              highestPrice: { $max: "$variants.globalPrice" },
              lowestPrice: { $min: "$variants.globalPrice" },
            },
          },
          { $project: { _id: 0, highestPrice: 1, lowestPrice: 1 } },
        ],
        specifications: [
          {
            $project: {
              _id: 0,
              color: 1,
              brand: 1,
              ramSize: "$specifications.ramSize",
              graphics: "$specifications.graphics",
              processor: "$specifications.processor",
              cpuSpeed: "$specifications.cpuSpeed",
              cpuManufacturer: "$specifications.cpuManufacturer",
              graphicsManufacturer: "$specifications.graphicsManufacturer",
              screenSize: "$specifications.screenSize",
              resolution: "$specifications.resolution",
              storage: "$specifications.storage",
              memory: "$specifications.memory",
              cameraResolution: "$specifications.cameraResolution",
              operatingSystem: "$specifications.operatingSystem",
            },
          },
          { $project: { specificationsArray: { $objectToArray: "$$ROOT" } } },
          { $unwind: "$specificationsArray" },
          {
            $group: {
              _id: "$specificationsArray.k",
              values: { $addToSet: "$specificationsArray.v" },
            },
          },
          {
            $project: {
              key: "$_id",
              filters: { $sortArray: { input: "$values", sortBy: -1 } },
              _id: 0,
            },
          },
          { $sort: { key: 1 } },
        ],
      },
    },
  ]);

  res.status(200).json({ filters: result[0] });
};

export { productFilters };
