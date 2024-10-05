import { Request, Response, NextFunction } from "express";

export const paginateResults = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results: any = {};

  if (endIndex < (res.locals.totalCount || 0)) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  res.locals.paginationOptions = {
    startIndex,
    limit,
    results,
  };

  next();
};

// Usage in your controller:
// export const getAllProducts = async (req: Request, res: Response) => {
//   const totalCount = await Product.countDocuments();
//   res.locals.totalCount = totalCount;

//   const { startIndex, limit, results } = res.locals.paginationOptions;

//   const products = await Product.find().skip(startIndex).limit(limit);

//   results.data = products;

//   res.status(200).json(results);
// };
