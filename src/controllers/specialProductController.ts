import { Request, Response, NextFunction } from "express";
import specialProductService from "../services/specialProductService";
import createError from "http-errors";

class SpecialProductController {
  async bestOffers(req: Request, res: Response, next: NextFunction) {
    const categoriesWithBestOffers =
      await specialProductService.getCategoriesWithBestOffers();
    res.status(200).json({ categoriesWithBestOffers });
  }

  async bestSeller(req: Request, res: Response, next: NextFunction) {
    const categoriesWithBestSellers =
      await specialProductService.getCategoriesWithBestSellers();
    res.status(200).json({ categoriesWithBestSellers });
  }

  async liveSearch(req: Request, res: Response, next: NextFunction) {
    const query = req.query.query as string;
    const parentCategoryId = req.query.parentCategoryId as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.length < 2) {
      return next(createError(400, "Query must be at least 2 characters long"));
    }

    const products = await specialProductService.searchProducts(
      query,
      parentCategoryId,
      limit
    );
    res.status(200).json({ products });
  }

  async productFilters(req: Request, res: Response, next: NextFunction) {
    const { parentCategoryId, categoryId } = req.query;

    if (!parentCategoryId) {
      return next(createError(400, "parentCategoryId is required"));
    }

    const filters = await specialProductService.getProductFilters(
      parentCategoryId as string,
      categoryId as string
    );

    res.status(200).json({ filters });
  }

  async recommendedProducts(req: Request, res: Response, next: NextFunction) {
    const { categoryId, limit = "10", excludeProductId } = req.query;

    const recommendedProducts =
      await specialProductService.getRecommendedProducts(
        categoryId as string,
        excludeProductId as string,
        parseInt(limit as string)
      );

    res.status(200).json({ recommendedProducts });
  }
}

export const specialProductController = new SpecialProductController();
