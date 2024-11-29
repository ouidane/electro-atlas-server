import { Types } from "mongoose";
import createError from "http-errors";
import { Product } from "../models";
import { ImageUrls, ProductData } from "../types/types";
import {
  CloudinaryService,
  IMAGE_SIZES,
  ImageBuffer,
} from "./cloudinaryService";
import {
  buildFilterOption,
  buildSortOption,
  FilterHandlers,
} from "../utils/queryFilter";

class ProductService {
  private readonly CLOUDINARY_FOLDER = "r7skmjh9";
  private readonly cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService(
      {
        folder: "products",
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

  async getAllProducts(queryParams: any) {
    const { limit, page, sort, ...filters } = queryParams;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const queryObject = this.buildQueryObject(filters);
    const sortCriteria = this.buildSortCriteria(sort);

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

    const totalProducts = result[0].totalCount[0]?.value || 0;
    const products = result[0].products;

    return {
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        limit: limitNumber,
      },
    };
  }

  async getProductById(productId: string) {
    const product = await Product.findById(productId).populate("seller");
    if (!product) {
      throw createError(404, "Product not found");
    }
    return product;
  }

  async createProduct(productData: ProductData, images?: ImageBuffer[]) {
    const product = await Product.create(productData);

    if (images && images.length > 0) {
      await this.uploadProductImages(images, product);
    }

    return product;
  }

  async updateProduct(
    productId: string,
    updateData: Partial<ProductData>,
    images?: ImageBuffer[]
  ) {
    const product = await this.getProductById(productId);

    if (updateData.imagesToDelete) {
      await this.deleteProductImages(product, updateData.imagesToDelete);
    }

    if (updateData.reorderedImages) {
      this.reorderProductImages(product, updateData.reorderedImages);
    }

    if (images && images.length > 0) {
      await this.addNewProductImages(product, images);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...updateData, images: product.images },
      { new: true, runValidators: true }
    );

    return updatedProduct;
  }

  async deleteProduct(productId: string) {
    const product = await Product.findById(productId).lean();
    if (!product) {
      throw createError(404, "Product not found");
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          await this.cloudinaryService.destroyImage(image.publicId);
        })
      );
    }

    await Product.findByIdAndDelete(productId);
  }

  private buildQueryObject(filters: { [key: string]: string } | undefined) {
    const toObjectId = (id: string) => new Types.ObjectId(id);

    const filterHandlers: FilterHandlers = {
      // Original filters
      color: (v) => ({ $in: v.split(",") }),
      brand: (v) => ({ $in: v.split(",") }),
      query: (v) => ({ name: { $regex: new RegExp(v, "i") } }),
      sellerId: (v) => ({ sellerId: toObjectId(v) }),
      categoryId: (v) => ({ categoryId: toObjectId(v) }),
      parentCategoryId: (v) => ({ parentCategoryId: toObjectId(v) }),
      isFeatured: (v) => ({ isFeatured: v === "true" }),
      minRating: (v) => ({ "reviews.averageRating": { $gte: v } }),
      maxRating: (v) => ({ "reviews.averageRating": { $lte: v } }),
      minPrice: (v) => ({ "variants.salePrice": { $gte: v } }),
      maxPrice: (v) => ({ "variants.salePrice": { $lte: v } }),
      isAvailable: (v) => ({ "variants.inventory": { $gte: 1 } }),
      minStock: (v) => ({ "variants.inventory": { $gte: v } }),
      maxStock: (v) => ({ "variants.inventory": { $lte: v } }),
      minDiscount: (v) => ({ "variants.discountPercent": { $gte: v } }),
      maxDiscount: (v) => ({ "variants.discountPercent": { $lte: v } }),
      createdAfter: (v) => ({ createdAt: { $gte: new Date(v) } }),
      createdBefore: (v) => ({ createdAt: { $lte: new Date(v) } }),
      updatedAfter: (v) => ({ updatedAt: { $gte: new Date(v) } }),
      updatedBefore: (v) => ({ updatedAt: { $lte: new Date(v) } }),

      // Specifications handlers
      ramSize: (v) => ({ "specifications.ramSize": { $in: v.split(",") } }),
      graphics: (v) => ({ "specifications.graphics": { $in: v.split(",") } }),
      processor: (v) => ({ "specifications.processor": { $in: v.split(",") } }),
      cpuSpeed: (v) => ({ "specifications.cpuSpeed": { $in: v.split(",") } }),
      cpuManufacturer: (v) => ({
        "specifications.cpuManufacturer": { $in: v.split(",") },
      }),
      graphicsProcessorManufacturer: (v) => ({
        "specifications.graphicsProcessorManufacturer": { $in: v.split(",") },
      }),
      hardDriveSize: (v) => ({
        "specifications.hardDriveSize": { $in: v.split(",") },
      }),
      screenSize: (v) => ({
        "specifications.screenSize": { $in: v.split(",") },
      }),
      resolution: (v) => ({
        "specifications.resolution": { $in: v.split(",") },
      }),
      storage: (v) => ({ "specifications.storage": { $in: v.split(",") } }),
      memory: (v) => ({ "specifications.memory": { $in: v.split(",") } }),
      cameraResolution: (v) => ({
        "specifications.cameraResolution": { $in: v.split(",") },
      }),
      operatingSystem: (v) => ({
        "specifications.operatingSystem": { $in: v.split(",") },
      }),
      audioOutput: (v) => ({
        "specifications.audioOutput": { $in: v.split(",") },
      }),
      connectivity: (v) => ({
        "specifications.connectivity": { $in: v.split(",") },
      }),
      batteryLife: (v) => ({
        "specifications.batteryLife": { $in: v.split(",") },
      }),
      weight: (v) => ({ "specifications.weight": { $in: v.split(",") } }),
      sensors: (v) => ({ "specifications.sensors": { $in: v.split(",") } }),
      waterResistance: (v) => ({
        "specifications.waterResistance": { $in: v.split(",") },
      }),
      fitnessTracking: (v) => ({
        "specifications.fitnessTracking": { $in: v.split(",") },
      }),
      sleepTracking: (v) => ({
        "specifications.sleepTracking": { $in: v.split(",") },
      }),
      compatiblePlatforms: (v) => ({
        "specifications.compatiblePlatforms": { $in: v.split(",") },
      }),
      voiceControl: (v) => ({
        "specifications.voiceControl": { $in: v.split(",") },
      }),
      energyEfficiency: (v) => ({
        "specifications.energyEfficiency": { $in: v.split(",") },
      }),
      remoteControl: (v) => ({
        "specifications.remoteControl": { $in: v.split(",") },
      }),
    };

    return buildFilterOption(filters, filterHandlers);
  }

  private buildSortCriteria(sort: string) {
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
    return buildSortOption(sort, AllowedSortFields);
  }

  private async uploadProductImages(
    images: ImageBuffer[],
    product: any
  ): Promise<void> {
    for (const image of images) {
      await this.handleImageUpload(product, image);
    }
    await product.save();
  }

  private async handleImageUpload(
    product: any,
    image: ImageBuffer
  ): Promise<void> {
    const randomStr = Math.random().toString(36).substring(2, 8);

    const imageUrls = await this.cloudinaryService.uploadImage(
      image,
      this.CLOUDINARY_FOLDER,
      `product_${randomStr}_${product._id}`,
      {
        transformation: [
          { width: IMAGE_SIZES.LARGE, crop: "scale" },
          { quality: "auto" },
        ],
      }
    );

    product.images.push(imageUrls);
  }

  private async deleteProductImages(product: any, imagesToDelete: string[]) {
    product.images = product.images?.filter(
      (img: ImageUrls) => !imagesToDelete.includes(img.publicId)
    );

    await Promise.all(
      imagesToDelete.map(async (imagePublicId) => {
        await this.cloudinaryService.destroyImage(imagePublicId);
      })
    );
  }

  private reorderProductImages(product: any, reorderedImages: string[]) {
    if (reorderedImages.length === product.images?.length) {
      let arrangedImages: ImageUrls[] = [];
      for (const publicId of reorderedImages) {
        const image = product.images?.find(
          (img: ImageUrls) => img.publicId === publicId
        );
        if (image) {
          arrangedImages.push(image);
        } else {
          throw createError(400, "Image publicId not found.");
        }
      }
      product.images = arrangedImages;
    } else {
      throw createError(400, "Invalid image order.");
    }
  }

  private async addNewProductImages(product: any, images: ImageBuffer[]) {
    const existingImagesCount = product.images?.length || 0;
    const newImagesCount = images.length;
    const totalImagesCount = existingImagesCount + newImagesCount;

    if (totalImagesCount > 10) {
      throw createError(400, "Total number of images cannot exceed 10.");
    }

    await this.uploadProductImages(images, product);
  }
}

export const productService = new ProductService();
