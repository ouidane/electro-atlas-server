import { FilterQuery } from "mongoose";
import { ParentCategory, Category } from "../models";
import createError from "http-errors";
import {
  CloudinaryService,
  IMAGE_SIZES,
  ImageBuffer,
} from "./cloudinaryService";
import { buildSortOption } from "../utils/queryFilter";

// Enums and Constants
enum SortFields {
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
  Name = "name",
}

// Interfaces
interface BaseCategoryFields {
  name?: string;
  description?: string;
  image?: ImageBuffer;
}

interface CategoryCreate extends Required<Omit<BaseCategoryFields, "image">> {
  image?: ImageBuffer;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface QueryOptions {
  name?: string;
  sort?: string;
}

class CategoryService {
  private readonly cloudinaryService: CloudinaryService;
  private readonly CLOUDINARY_FOLDER = "nwmuofs9";
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly MAX_PAGE_SIZE = 100;
  private readonly AllowedSortFields: Record<string, string> = SortFields;

  constructor() {
    this.cloudinaryService = new CloudinaryService(
      {
        folder: "categories",
        quality: "auto",
        format: "auto",
      },
      {
        defaultTransformation: {
          fetch_format: "auto",
          quality: "auto",
        },
      }
    );
  }

  private buildQueryOption(name?: string, parentCategoryId?: string) {
    const queryObject: FilterQuery<any> = {};
    if (parentCategoryId) queryObject.parentCategoryId = parentCategoryId;
    if (name) queryObject.name = { $regex: new RegExp(name, "i") };

    return queryObject;
  }

  // Parent Category Methods
  async getParentCategories(options: PaginationOptions & QueryOptions) {
    const {
      page = 1,
      limit = this.DEFAULT_PAGE_SIZE,
      name,
      sort = SortFields.CreatedAt,
    } = options;

    const skip = (page - 1) * limit;
    const queryObject = this.buildQueryOption(name);
    const sortCriteria = buildSortOption(sort, this.AllowedSortFields);

    const [parentCategories, totalCategories] = await Promise.all([
      ParentCategory.find(queryObject)
        .select("-__v")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ParentCategory.countDocuments(queryObject),
    ]);

    return {
      data: parentCategories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        totalCount: totalCategories,
        limit,
      },
    };
  }

  async getSingleParentCategory(parentCategoryId: string) {
    const parentCategory = await ParentCategory.findById(parentCategoryId)
      .select("-__v")
      .lean();

    if (!parentCategory) {
      throw createError(404, "Parent category not found");
    }

    return { data: parentCategory };
  }

  async createParentCategory({ name, description, image }: CategoryCreate) {
    const parentCategory = await ParentCategory.create({ name, description });

    if (image) {
      await this.handleImageUpload(parentCategory, image);
    }
  }

  async updateParentCategory(
    parentCategoryId: string,
    { name, description, image }: BaseCategoryFields
  ) {
    const parentCategory = await ParentCategory.findById(parentCategoryId);

    if (!parentCategory) {
      throw createError(404, "Category not found");
    }

    if (name) parentCategory.name = name;
    if (description) parentCategory.description = description;
    if (image) {
      await this.updateCategoryImage(parentCategory, image);
    } else {
      await parentCategory.save();
    }
  }

  async deleteParentCategory(parentCategoryId: string) {
    const parentCategory = await ParentCategory.findById(parentCategoryId);
    if (!parentCategory) {
      throw createError(404, "Category not found");
    }

    if (parentCategory.image?.publicId) {
      await this.cloudinaryService.destroyImage(parentCategory.image.publicId);
    }

    await ParentCategory.findByIdAndDelete(parentCategoryId);
  }

  // Child Category Methods
  async getChildCategories(
    parentCategoryId: string,
    options: PaginationOptions & QueryOptions
  ) {
    const {
      page = 1,
      limit = this.DEFAULT_PAGE_SIZE,
      name,
      sort = SortFields.CreatedAt,
    } = options;

    const skip = (page - 1) * limit;
    const queryObject = this.buildQueryOption(name, parentCategoryId);
    const sortCriteria = buildSortOption(sort, this.AllowedSortFields);

    const [parentCategories, totalCategories] = await Promise.all([
      Category.find(queryObject)
        .select("-__v")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(queryObject),
    ]);

    return {
      data: parentCategories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        totalCount: totalCategories,
        limit,
      },
    };
  }

  async getSingleChildCategory(
    childCategoryId: string,
    parentCategoryId: string
  ) {
    const childCategory = await Category.findOne({
      _id: childCategoryId,
      parentCategoryId,
    })
      .select("-__v")
      .lean();

    if (!childCategory) {
      throw createError(404, "Child category not found");
    }

    return { data: childCategory };
  }

  async createChildCategory({
    parentCategoryId,
    name,
    description,
    image,
  }: BaseCategoryFields & { parentCategoryId: string }) {
    const parentCategory = await ParentCategory.findById(
      parentCategoryId
    ).lean();
    if (!parentCategory) {
      throw createError(404, "Parent category not found");
    }

    const childCategory = await Category.create({
      name,
      description,
      parentCategoryId,
    });

    if (image) {
      await this.handleImageUpload(childCategory, image);
    }
  }

  async updateChildCategory(
    childCategoryId: string,
    parentCategoryId: string,
    { name, description, image }: BaseCategoryFields
  ) {
    const [parentCategory, childCategory] = await Promise.all([
      ParentCategory.findById(parentCategoryId).lean(),
      Category.findById(childCategoryId),
    ]);

    if (!parentCategory) {
      throw createError(404, "Parent category not found");
    }

    if (!childCategory) {
      throw createError(404, "Child category not found");
    }

    if (name) childCategory.name = name;
    if (description) childCategory.description = description;
    if (image) {
      await this.updateCategoryImage(childCategory, image);
    } else {
      await childCategory.save();
    }
  }

  async deleteChildCategory(childCategoryId: string, parentCategoryId: string) {
    const [parentCategory, childCategory] = await Promise.all([
      ParentCategory.findById(parentCategoryId),
      Category.findById(childCategoryId),
    ]);

    if (!parentCategory) {
      throw createError(404, "Parent category not found");
    }

    if (!childCategory) {
      throw createError(404, "Child category not found");
    }

    if (childCategory.image?.publicId) {
      await this.cloudinaryService.destroyImage(childCategory.image.publicId);
    }

    await Category.findByIdAndDelete(childCategoryId);
  }

  private async handleImageUpload(category: any, image: ImageBuffer) {
    const imageUrls = await this.cloudinaryService.uploadImage(
      image,
      this.CLOUDINARY_FOLDER,
      `category_${category._id}`,
      {
        transformation: [
          { width: IMAGE_SIZES.LARGE, crop: "scale" },
          { quality: "auto" },
        ],
      }
    );

    category.image = imageUrls;
    await category.save();
  }

  async updateCategoryImage(category: any, newImage: ImageBuffer) {
    if (category.image?.publicId) {
      // Replace existing image
      const imageUrls = await this.cloudinaryService.replaceImage(
        category.image.publicId,
        newImage,
        this.CLOUDINARY_FOLDER,
        `category_${category._id}`
      );
      category.image = imageUrls;
    } else {
      // Upload new image
      await this.handleImageUpload(category, newImage);
    }

    await category.save();
  }
}

export const categoryService = new CategoryService();
