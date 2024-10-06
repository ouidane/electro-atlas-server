import { Request, Response, NextFunction } from "express";
import { ParentCategory, Category } from "../models";
import createError from "http-errors";
import {
  destroyImage,
  generateImageUrls,
  uploadToCloudinary,
} from "../utils/cloudinary";
import { buildSortOption } from "../utils/sortHandler";

// Get all parent categories
const getParentCategories = async (req: Request, res: Response) => {
  const { name, sort = "createdAt", page = "1", limit = "10" } = req.query;

  const pageNumber = parseInt(page as string) || 10;
  const limitNumber = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const queryObject: any = {};
  if (name) {
    queryObject.name = { $regex: new RegExp(name.toString(), "i") };
  }

  const AllowedSortFields = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    name: "name",
  };
  const sortCriteria = buildSortOption(sort as string, AllowedSortFields);

  const parentCategories = await ParentCategory.find(queryObject)
    .select("-__v")
    .sort(sortCriteria)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalCategories = await ParentCategory.countDocuments(queryObject);

  res.status(200).json({
    parentCategories,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCategories / limitNumber),
      totalCategories: totalCategories,
      limit: limitNumber,
    },
  });
};

// Get single parent category
const getSingleParentCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parentCategoryId = req.params.parentCategoryId;

  const parentCategory = await ParentCategory.findById(parentCategoryId)
    .select("-__v")
    .lean();
  if (!parentCategory) {
    return next(createError(404, "Parent category not found"));
  }

  res.status(200).json({ parentCategory });
};

const createParentCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description } = req.body;
  const image = req.file;

  let parentCategory = await ParentCategory.create({ name, description });

  if (!parentCategory) {
    return next(createError(500, "Failed to create category"));
  }

  if (image) {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = "data:" + image.mimetype + ";base64," + b64;

    // Await the result of uploadToCloudinary
    const result = await uploadToCloudinary(
      dataURI,
      "nwmuofs9",
      `category_${parentCategory._id}`
    );
    const imageUrls = generateImageUrls(result.public_id);

    // Update the category with image URLs
    parentCategory.image = imageUrls;
    await parentCategory.save();
  }

  return res.status(201).json({ message: "Category created." });
};

// Function to update a category
const updateParentCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parentCategoryId } = req.params;
  const { name, description } = req.body;
  const image = req.file;

  let parentCategory = await ParentCategory.findByIdAndUpdate(
    parentCategoryId,
    { name, description },
    { new: true }
  );

  if (!parentCategory) {
    return next(createError(404, "Category not found"));
  }

  if (image) {
    if (parentCategory.image && parentCategory.image.publicId) {
      // Delete the image from Cloudinary
      await destroyImage(parentCategory.image.publicId);
    }

    // Handle image update if a new file is present
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = "data:" + image.mimetype + ";base64," + b64;

    // Await the result of uploadToCloudinary
    const result = await uploadToCloudinary(
      dataURI,
      "nwmuofs9",
      `category_${parentCategory._id}`
    );
    const imageUrls = generateImageUrls(result.public_id);

    // Update the category with new image URLs
    parentCategory.image = imageUrls;
    await parentCategory.save();
  }

  return res.status(200).json({ message: "Category updated." });
};

// Function to delete a category
const deleteParentCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parentCategoryId } = req.params;
  const parentCategory = await ParentCategory.findById(parentCategoryId);

  if (!parentCategory) {
    return next(createError(404, "Category not found"));
  }

  if (parentCategory.image && parentCategory.image.publicId) {
    // Delete the image from Cloudinary
    await destroyImage(parentCategory.image.publicId);
  }

  await ParentCategory.findByIdAndDelete(parentCategoryId);

  return res.status(200).json({ message: "Category deleted." });
};

// Get all child categories
const getChildCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parentCategoryId } = req.params;
  const { name, sort = "createdAt", page = "1", limit = "10" } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Build the query object
  const queryObject: any = { parentCategoryId };
  if (name) queryObject.name = { $regex: new RegExp(name as string, "i") };

  const AllowedSortFields = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    name: "name",
  };
  const sortCriteria = buildSortOption(sort as string, AllowedSortFields);

  const childCategories = await Category.find(queryObject)
    .populate({
      path: "parentCategory",
      select: "-__v",
      options: { lean: true },
    })
    .select("-__v")
    .sort(sortCriteria)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  if (!childCategories || childCategories.length === 0) {
    return next(createError(404, "Categories not found"));
  }

  // Get total count for pagination
  const totalCount = await Category.countDocuments(queryObject);

  res.status(200).json({
    childCategories,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalCount,
      limit: limitNumber,
    },
  });
};

// Get single child category
const getSingleChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { childCategoryId, parentCategoryId } = req.params;

  const childCategory = await Category.findOne({
    _id: childCategoryId,
    parentCategoryId,
  })
    .select("-__v")
    .lean();
  if (!childCategory) {
    return next(createError(404, "Child category not found"));
  }

  res.status(200).json({ childCategory });
};

const createChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parentCategoryId } = req.params;
  const { name, description } = req.body;
  const image = req.file;

  const parentCategory = await ParentCategory.findById(parentCategoryId).lean();
  if (!parentCategory) {
    return next(createError(404, "Parent category not found"));
  }

  let childCategory = await Category.create({
    name,
    description,
    parentCategoryId,
  });

  if (!childCategory) {
    return next(createError(500, "Failed to create category"));
  }

  if (image) {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = "data:" + image.mimetype + ";base64," + b64;

    // Await the result of uploadToCloudinary
    const result = await uploadToCloudinary(
      dataURI,
      "nwmuofs9",
      `category_${childCategory._id}`
    );
    const imageUrls = generateImageUrls(result.public_id);

    // Update the category with image URLs
    childCategory.image = imageUrls;
    await childCategory.save();
  }

  return res.status(201).json({ message: "Category created." });
};

// Function to update a category
const updateChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { childCategoryId, parentCategoryId } = req.params;
  const { name, description } = req.body;
  const image = req.file;

  const parentCategory = await ParentCategory.findById(parentCategoryId).lean();
  if (!parentCategory) {
    return next(createError(404, "Parent category not found"));
  }

  let childCategory = await Category.findByIdAndUpdate(
    childCategoryId,
    { name, description, parentCategoryId },
    { new: true }
  );
  if (!childCategory) {
    return next(createError(404, "Category not found"));
  }

  if (image) {
    if (childCategory.image && childCategory.image.publicId) {
      // Delete the image from Cloudinary
      await destroyImage(childCategory.image.publicId);
    }

    // Handle image update if a new file is present
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = "data:" + image.mimetype + ";base64," + b64;

    // Await the result of uploadToCloudinary
    const result = await uploadToCloudinary(
      dataURI,
      "nwmuofs9",
      `category_${childCategory._id}`
    );
    const imageUrls = generateImageUrls(result.public_id);

    // Update the category with new image URLs
    childCategory.image = imageUrls;
    await childCategory.save();
  }

  return res.status(200).json({ message: "Category updated." });
};

// Function to delete a category
const deleteChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { childCategoryId, parentCategoryId } = req.params;

  const parentCategory = await ParentCategory.findById(parentCategoryId);
  if (!parentCategory) {
    return next(createError(404, "Parent category not found"));
  }

  const childCategory = await Category.findById(childCategoryId);
  if (!childCategory) {
    return next(createError(404, "Category not found"));
  }

  if (childCategory.image && childCategory.image.publicId) {
    // Delete the image from Cloudinary
    await destroyImage(childCategory.image.publicId);
  }

  await Category.findByIdAndDelete(childCategoryId);

  return res.status(200).json({ message: "Category deleted." });
};

export {
  getParentCategories,
  getSingleParentCategory,
  createParentCategory,
  updateParentCategory,
  deleteParentCategory,
  getChildCategories,
  getSingleChildCategory,
  createChildCategory,
  updateChildCategory,
  deleteChildCategory,
};
