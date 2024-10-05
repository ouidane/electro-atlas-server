import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Product } from "../models";
import createError from "http-errors";

export const liveSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query.query as string;
  const parentCategoryId = req.query.parentCategoryId as string;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!query || query.length < 2) {
    return next(createError(400, "Query must be at least 2 characters long"));
  }

  const searchStage: any = {
    $search: {
      index: "default", // Make sure you've created this index
      compound: {
        must: [
          {
            text: {
              query: query,
              path: "name",
              fuzzy: {
                maxEdits: 1,
                prefixLength: 2,
              },
            },
          },
        ],
        should: [
          {
            text: {
              query: query,
              path: "description",
              score: { boost: { value: 1.5 } },
            },
          },
        ],
      },
      highlight: {
        path: ["name", "description"],
      },
    },
  };

  if (parentCategoryId) {
    searchStage.$search.compound.must.push({
      equals: {
        path: "parentCategoryId",
        value: new Types.ObjectId(parentCategoryId),
      },
    });
  }

  const products = await Product.aggregate([
    searchStage,
    { $limit: limit },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        score: { $meta: "searchScore" },
        highlights: { $meta: "searchHighlights" },
      },
    },
  ]);

  res.status(200).json({ products });
};
