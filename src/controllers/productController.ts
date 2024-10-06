import { Request, Response, NextFunction } from "express";
import { Category, ParentCategory, Product } from "../models";
import createError from "http-errors";
import mongoose from "mongoose";
import {
  destroyImage,
  generateImageUrls,
  uploadToCloudinary,
} from "../utils/cloudinary";
import { type ImageUrls } from "../@types/types";
import { ProductDoc } from "../models/productModel";
import { ProductVariantsDoc } from "../models/productVariantsModel";
import { ProductSpecificationsDoc } from "../models/productSpecificationsModel";
import { buildSortOption } from "../utils/sortHandler";

const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, sort, ...filters } = req.query as any;

  const specifications = [
    "ramSize",
    "graphics",
    "processor",
    "cpuSpeed",
    "cpuManufacturer",
    "graphicsProcessorManufacturer",
    "hardDriveSize",
    "screenSize",
    "resolution",
    "storage",
    "memory",
    "cameraResolution",
    "operatingSystem",
    "audioOutput",
    "connectivity",
    "batteryLife",
    "weight",
    "sensors",
    "waterResistance",
    "fitnessTracking",
    "sleepTracking",
    "compatiblePlatforms",
    "voiceControl",
    "energyEfficiency",
    "remoteControl",
  ];

  const queryObject: any = {}; // Initialize empty query object

  const filterHandlers: any = {
    color: (value: string) => ({ $in: value.split(",") }),
    brand: (value: string) => ({ $in: value.split(",") }),
    query: (value: string) => ({ name: { $regex: new RegExp(value, "i") } }),
    sellerId: (value: string) => ({
      sellerId: new mongoose.Types.ObjectId(value),
    }),
    categoryId: (value: string) => ({
      categoryId: new mongoose.Types.ObjectId(value),
    }),
    parentCategoryId: (value: string) => ({
      parentCategoryId: new mongoose.Types.ObjectId(value),
    }),
    lowestPrice: (value: string) => ({
      "variants.salePrice": { $gte: parseInt(value) },
    }),
    highestPrice: (value: string) => ({
      "variants.salePrice": { $lte: parseInt(value) },
    }),
  };

  for (const [key, value] of Object.entries(filters)) {
    if (key in filterHandlers) {
      Object.assign(queryObject, filterHandlers[key](value));
    } else if (specifications.includes(key)) {
      queryObject[`specifications.${key}`] = {
        $in: (value as string).split(","),
      };
    }
  }

  const AllowedSortFields = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    rating: "reviews.averageRating",
    numOfReviews: "reviews.numOfReviews",
    price: "variant.salePrice",
    discount: "variant.discountPercent",
    popularity: "popularity",
    bestSelling: "salesCount",
    stockAvailability: "variant.inventory",
    featured: "isFeatured",
    name: "name",
  };
  const sortCriteria = buildSortOption(sort, AllowedSortFields);

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const result = await Product.aggregate([
    { $unwind: "$variants" },
    { $match: queryObject },
    {
      $facet: {
        totalCount: [{ $count: "value" }],
        products: [
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
          { $sort: sortCriteria },
          { $skip: skip },
          { $limit: limitNumber },
        ],
      },
    },
  ]);

  const totalProducts = result[0].totalCount[0].value || 0;
  const products = result[0].products;

  res.status(200).json({
    products,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
      limit: limitNumber,
    },
  });
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).populate("seller");
  if (!product) {
    return next(createError(404, "Product not found"));
  }

  res.status(200).json({ product });
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sellerId = req.user.id;
  const {
    name,
    description,
    brand,
    color,
    categoryId,
    parentCategoryId,
    variants,
    specifications,
  }: {
    name: string;
    description: string;
    brand: string;
    color?: string;
    categoryId: string;
    parentCategoryId: string;
    variants: ProductVariantsDoc[];
    specifications: ProductSpecificationsDoc;
  } = req.body;

  const childCategory = await Category.findById(categoryId);
  if (!childCategory) {
    return next(createError(404, "Category not found"));
  }

  const parentCategory = await ParentCategory.findById(categoryId);
  if (!parentCategory) {
    return next(createError(404, "Category not found"));
  }

  // Prepare the new product data
  const productData = {
    name,
    description,
    brand,
    color,
    categoryId,
    parentCategoryId,
    variants,
    specifications,
    sellerId,
  };

  const product = await Product.create(productData);

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    let productImages: ImageUrls[] = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = "data:" + file.mimetype + ";base64," + b64;
      const randomStr = Math.random().toString(36).substring(2, 8);

      // Await the result of uploadToCloudinary
      const result = await uploadToCloudinary(
        dataURI,
        "r7skmjh9",
        `product_${randomStr}_${product._id}`
      );

      const productImagesUrls = generateImageUrls(result.public_id);

      productImages.push(productImagesUrls);
    }

    // Update the product with images URLs
    product.images = productImages;
    await product.save();
  }

  res.status(200).json({ message: "product created" });
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const {
    imagesToDelete,
    reorderedImages,
    name,
    description,
    brand,
    color,
    categoryId,
    parentCategoryId,
    variants,
    specifications,
  }: {
    imagesToDelete?: string[];
    reorderedImages?: string[];
    name?: string;
    description?: string;
    brand?: string;
    color?: string;
    categoryId?: string;
    parentCategoryId?: string;
    variants?: ProductVariantsDoc[];
    specifications?: ProductSpecificationsDoc;
  } = req.body;

  // Prepare the new product data
  const productData = {
    name,
    description,
    brand,
    color,
    categoryId,
    parentCategoryId,
    variants,
    specifications,
  };

  const product = await Product.findByIdAndUpdate(productId, productData);
  if (!product) {
    return next(createError(404, "Product not found"));
  }

  // Delete the images from database and from Cloudinary
  if (imagesToDelete && imagesToDelete.length > 0) {
    for (let i = 0; i < imagesToDelete.length; i++) {
      product.images = product.images?.filter(
        (img) => img.publicId !== imagesToDelete[i]
      );
    }

    // Delete the images from Cloudinary
    await Promise.all(
      imagesToDelete.map(async (imagePublicId) => {
        await destroyImage(imagePublicId);
      })
    );
  }

  if (reorderedImages && reorderedImages.length === product.images?.length) {
    let arrangedImages: ImageUrls[] = [];
    for (let i = 0; i < reorderedImages.length; i++) {
      const publicId = product.images?.find(
        (img) => img.publicId === reorderedImages[i]
      );
      if (!publicId) {
        return next(createError(404, "Image publicId not found"));
      }

      arrangedImages.push(publicId);
    }
    // Update the product with images URLs
    product.images = arrangedImages;
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    // Check total images limit
    const existingImagesCount = product.images?.length || 0;
    const newImagesCount = req.files ? req.files.length : 0;
    const totalImagesCount = existingImagesCount + newImagesCount;
    if (totalImagesCount > 10) {
      return next(createError(400, "Total number of images cannot exceed 10."));
    }

    let productImages: ImageUrls[] = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = "data:" + file.mimetype + ";base64," + b64;
      const randomStr = Math.random().toString(36).substring(2, 8);

      // Upload To Cloudinary
      const result = await uploadToCloudinary(
        dataURI,
        "r7skmjh9",
        `product_${randomStr}_${product._id}`
      );

      const productImagesUrls = generateImageUrls(result.public_id);

      productImages.push(productImagesUrls);
    }

    // Update the product with images URLs
    product.images?.push(...productImages);
    await product.save();
  }

  res.status(200).json({ message: "product updated" });
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return next(createError(404, "product not found"));
  }

  if (product.images) {
    await Promise.all(
      product.images.map(async (image) => {
        // Delete the image from Cloudinary
        await destroyImage(image.publicId);
      })
    );
  }

  await Product.findByIdAndDelete(productId);

  res.status(200).json({ message: "product deleted" });
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
