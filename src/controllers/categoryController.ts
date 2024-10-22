import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService";
import createError from "http-errors";

class CategoryController {
  // Parent Category Controllers
  async getParentCategories(req: Request, res: Response) {
    const { name, sort, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (isNaN(pageNum) || pageNum < 1) {
      throw createError(400, "Page must be a positive number");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw createError(400, "Limit must be a positive number");
    }

    const result = await categoryService.getParentCategories({
      page: pageNum,
      limit: limitNum,
      name: name as string,
      sort: sort as string,
    });

    res.status(200).json(result);
  }

  async getSingleParentCategory(req: Request, res: Response) {
    const result = await categoryService.getSingleParentCategory(
      req.params.parentCategoryId
    );
    res.status(200).json(result);
  }

  async createParentCategory(req: Request, res: Response) {
    const { name, description } = req.body;

    if (!name) {
      throw createError(400, "Category name is required");
    }

    await categoryService.createParentCategory({
      name,
      description,
      image: req.file,
    });
    res.status(201).json({ message: "Category created successfully" });
  }

  async updateParentCategory(req: Request, res: Response) {
    const { name, description } = req.body;

    if (!name && !description && !req.file) {
      throw createError(
        400,
        "At least one field (name, description, or image) must be provided for update"
      );
    }

    await categoryService.updateParentCategory(req.params.parentCategoryId, {
      name,
      description,
      image: req.file,
    });
    res.status(200).json({ message: "Category updated successfully" });
  }

  async deleteParentCategory(req: Request, res: Response) {
    await categoryService.deleteParentCategory(req.params.parentCategoryId);
    res.status(200).json({ message: "Category deleted successfully" });
  }

  // Child Category Controllers
  async getChildCategories(req: Request, res: Response) {
    const { name, sort, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (isNaN(pageNum) || pageNum < 1) {
      throw createError(400, "Page must be a positive number");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw createError(400, "Limit must be a positive number");
    }

    const result = await categoryService.getChildCategories(
      req.params.parentCategoryId,
      {
        page: pageNum,
        limit: limitNum,
        name: name as string,
        sort: sort as string,
      }
    );
    res.status(200).json(result);
  }

  async getSingleChildCategory(req: Request, res: Response) {
    const result = await categoryService.getSingleChildCategory(
      req.params.childCategoryId,
      req.params.parentCategoryId
    );
    res.status(200).json(result);
  }

  async createChildCategory(req: Request, res: Response, next: NextFunction) {
    const { name, description } = req.body;
    await categoryService.createChildCategory({
      parentCategoryId: req.params.parentCategoryId,
      name,
      description,
      image: req.file,
    });
    res.status(201).json({ message: "Category created." });
  }

  async updateChildCategory(req: Request, res: Response, next: NextFunction) {
    const { name, description } = req.body;
    await categoryService.updateChildCategory(
      req.params.childCategoryId,
      req.params.parentCategoryId,
      {
        name,
        description,
        image: req.file,
      }
    );
    res.status(200).json({ message: "Category updated." });
  }

  async deleteChildCategory(req: Request, res: Response, next: NextFunction) {
    await categoryService.deleteChildCategory(
      req.params.childCategoryId,
      req.params.parentCategoryId
    );
    res.status(200).json({ message: "Category deleted." });
  }
}

export const categoryController = new CategoryController();
