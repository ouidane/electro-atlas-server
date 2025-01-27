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
import { de } from "@faker-js/faker/.";

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
      connectivity: (v) => ({
        "specifications.connectivity": { $in: v.split(",") },
      }),
      aspectRatio: (v) => ({
        "specifications.aspectRatio": { $in: v.split(",") },
      }),
      displayTechnology: (v) => ({
        "specifications.displayTechnology": { $in: v.split(",") },
      }),
      refreshRate: (v) => ({
        "specifications.refreshRate": { $in: v.split(",") },
      }),
      resolution: (v) => ({
        "specifications.resolution": { $in: v.split(",") },
      }),
      screenSize: (v) => ({
        "specifications.screenSize": { $in: v.split(",") },
      }),
      CameraFrameRate: (v) => ({
        "specifications.CameraFrameRate": { $in: v.split(",") },
      }),
      opticalZoom: (v) => ({
        "specifications.opticalZoom": { $in: v.split(",") },
      }),
      meteringDescription: (v) => ({
        "specifications.meteringDescription": { $in: v.split(",") },
      }),
      supportedFileFormat: (v) => ({
        "specifications.supportedFileFormat": { $in: v.split(",") },
      }),
      maximumAperture: (v) => ({
        "specifications.maximumAperture": { $in: v.split(",") },
      }),
      imageStabilization: (v) => ({
        "specifications.imageStabilization": { $in: v.split(",") },
      }),
      maximumFocalLength: (v) => ({
        "specifications.maximumFocalLength": { $in: v.split(",") },
      }),
      expandedIsoMinimum: (v) => ({
        "specifications.expandedIsoMinimum": { $in: v.split(",") },
      }),
      photoSensorTechnology: (v) => ({
        "specifications.photoSensorTechnology": { $in: v.split(",") },
      }),
      maximumWebcamImageResolution: (v) => ({
        "specifications.maximumWebcamImageResolution": { $in: v.split(",") },
      }),
      videoCaptureResolution: (v) => ({
        "specifications.videoCaptureResolution": { $in: v.split(",") },
      }),
      flashMemoryType: (v) => ({
        "specifications.flashMemoryType": { $in: v.split(",") },
      }),
      printingTechnology: (v) => ({
        "specifications.printingTechnology": { $in: v.split(",") },
      }),
      printerOutput: (v) => ({
        "specifications.printerOutput": { $in: v.split(",") },
      }),
      maximumPrintSpeed: (v) => ({
        "specifications.maximumPrintSpeed": { $in: v.split(",") },
      }),
      printerMediaSizeMaximum: (v) => ({
        "specifications.printerMediaSizeMaximum": { $in: v.split(",") },
      }),
      printMedia: (v) => ({
        "specifications.printMedia": { $in: v.split(",") },
      }),
      scannerType: (v) => ({
        "specifications.scannerType": { $in: v.split(",") },
      }),
      compatibleDevices: (v) => ({
        "specifications.compatibleDevices": { $in: v.split(",") },
      }),
      displayType: (v) => ({
        "specifications.displayType": { $in: v.split(",") },
      }),
      sheetSize: (v) => ({ "specifications.sheetSize": { $in: v.split(",") } }),
      zoom: (v) => ({ "specifications.zoom": { $in: v.split(",") } }),
      digitalZoom: (v) => ({
        "specifications.digitalZoom": { $in: v.split(",") },
      }),
      lensConstruction: (v) => ({
        "specifications.lensConstruction": { $in: v.split(",") },
      }),
      lensType: (v) => ({ "specifications.lensType": { $in: v.split(",") } }),
      videoOutput: (v) => ({
        "specifications.videoOutput": { $in: v.split(",") },
      }),
      photoSensorResolution: (v) => ({
        "specifications.photoSensorResolution": { $in: v.split(",") },
      }),
      audioInput: (v) => ({
        "specifications.audioInput": { $in: v.split(",") },
      }),
      audioOutputType: (v) => ({
        "specifications.audioOutputType": { $in: v.split(",") },
      }),
      batteryAverageLife: (v) => ({
        "specifications.batteryAverageLife": { $in: v.split(",") },
      }),
      sensorType: (v) => ({
        "specifications.sensorType": { $in: v.split(",") },
      }),
      totalStillResolution: (v) => ({
        "specifications.totalStillResolution": { $in: v.split(",") },
      }),
      maximumImageSize: (v) => ({
        "specifications.maximumImageSize": { $in: v.split(",") },
      }),
      compatibleMountings: (v) => ({
        "specifications.compatibleMountings": { $in: v.split(",") },
      }),
      maxPrintspeedMonochrome: (v) => ({
        "specifications.maxPrintspeedMonochrome": { $in: v.split(",") },
      }),
      controllerType: (v) => ({
        "specifications.controllerType": { $in: v.split(",") },
      }),
      shape: (v) => ({ "specifications.shape": { $in: v.split(",") } }),
      gps: (v) => ({ "specifications.gps": { $in: v.split(",") } }),
      chipsetBrand: (v) => ({
        "specifications.chipsetBrand": { $in: v.split(",") },
      }),
      videoOutputInterface: (v) => ({
        "specifications.videoOutputInterface": { $in: v.split(",") },
      }),
      cacheSize: (v) => ({ "specifications.cacheSize": { $in: v.split(",") } }),
      graphicsCardDescription: (v) => ({
        "specifications.graphicsCardDescription": { $in: v.split(",") },
      }),
      numberOfProcessors: (v) => ({
        "specifications.numberOfProcessors": { $in: v.split(",") },
      }),
      hardDiskFormFactor: (v) => ({
        "specifications.hardDiskFormFactor": { $in: v.split(",") },
      }),
      hardDiskDescription: (v) => ({
        "specifications.hardDiskDescription": { $in: v.split(",") },
      }),
      installationType: (v) => ({
        "specifications.installationType": { $in: v.split(",") },
      }),
      movementDetectionTechnology: (v) => ({
        "specifications.movementDetectionTechnology": { $in: v.split(",") },
      }),
      mediaType: (v) => ({ "specifications.mediaType": { $in: v.split(",") } }),
      colorDepth: (v) => ({
        "specifications.colorDepth": { $in: v.split(",") },
      }),
      standardSheetCapacity: (v) => ({
        "specifications.standardSheetCapacity": { $in: v.split(",") },
      }),
      opticalSensorTechnology: (v) => ({
        "specifications.opticalSensorTechnology": { $in: v.split(",") },
      }),
      AudioEncoding: (v) => ({
        "specifications.AudioEncoding": { $in: v.split(",") },
      }),
      AudioOutputMode: (v) => ({
        "specifications.AudioOutputMode": { $in: v.split(",") },
      }),
      TotalHdmiPorts: (v) => ({
        "specifications.TotalHdmiPorts": { $in: v.split(",") },
      }),
      surroundSoundChannelConfiguration: (v) => ({
        "specifications.surroundSoundChannelConfiguration": {
          $in: v.split(","),
        },
      }),
      careInstructions: (v) => ({
        "specifications.careInstructions": { $in: v.split(",") },
      }),
      speakerMaximumOutputPower: (v) => ({
        "specifications.speakerMaximumOutputPower": { $in: v.split(",") },
      }),
      speakerMaximumVolume: (v) => ({
        "specifications.speakerMaximumVolume": { $in: v.split(",") },
      }),
      fabricType: (v) => ({
        "specifications.fabricType": { $in: v.split(",") },
      }),
      origin: (v) => ({ "specifications.origin": { $in: v.split(",") } }),
      operatingSystem: (v) => ({
        "specifications.operatingSystem": { $in: v.split(",") },
      }),
      cellularTechnology: (v) => ({
        "specifications.cellularTechnology": { $in: v.split(",") },
      }),
      batteryPowerRating: (v) => ({
        "specifications.batteryPowerRating": { $in: v.split(",") },
      }),
      batteryCapacity: (v) => ({
        "specifications.batteryCapacity": { $in: v.split(",") },
      }),
      wirelessNetworkTechnology: (v) => ({
        "specifications.wirelessNetworkTechnology": { $in: v.split(",") },
      }),
      material: (v) => ({ "specifications.material": { $in: v.split(",") } }),
      connectorType: (v) => ({
        "specifications.connectorType": { $in: v.split(",") },
      }),
      inputVoltage: (v) => ({
        "specifications.inputVoltage": { $in: v.split(",") },
      }),
      mountingType: (v) => ({
        "specifications.mountingType": { $in: v.split(",") },
      }),
      humanInterfaceInput: (v) => ({
        "specifications.humanInterfaceInput": { $in: v.split(",") },
      }),
      WirelessCommunicationStandard: (v) => ({
        "specifications.WirelessCommunicationStandard": { $in: v.split(",") },
      }),
      department: (v) => ({
        "specifications.department": { $in: v.split(",") },
      }),
      specificUsesForProduct: (v) => ({
        "specifications.specificUsesForProduct": { $in: v.split(",") },
      }),
      ramSize: (v) => ({ "specifications.ramSize": { $in: v.split(",") } }),
      ramMemoryTechnology: (v) => ({
        "specifications.ramMemoryTechnology": { $in: v.split(",") },
      }),
      memorySpeed: (v) => ({
        "specifications.memorySpeed": { $in: v.split(",") },
      }),
      cpuModel: (v) => ({ "specifications.cpuModel": { $in: v.split(",") } }),
      cpuBrand: (v) => ({ "specifications.cpuBrand": { $in: v.split(",") } }),
      hardDriveInterface: (v) => ({
        "specifications.hardDriveInterface": { $in: v.split(",") },
      }),
      hardDriveSize: (v) => ({
        "specifications.hardDriveSize": { $in: v.split(",") },
      }),
      hardDrive: (v) => ({ "specifications.hardDrive": { $in: v.split(",") } }),
      graphicsCoprocessor: (v) => ({
        "specifications.graphicsCoprocessor": { $in: v.split(",") },
      }),
      graphicsRamSize: (v) => ({
        "specifications.graphicsRamSize": { $in: v.split(",") },
      }),
      compatiblePlatform: (v) => ({
        "specifications.compatiblePlatform": { $in: v.split(",") },
      }),
      lockType: (v) => ({ "specifications.lockType": { $in: v.split(",") } }),
      finishType: (v) => ({
        "specifications.finishType": { $in: v.split(",") },
      }),
      lampType: (v) => ({ "specifications.lampType": { $in: v.split(",") } }),
      shadeColor: (v) => ({
        "specifications.shadeColor": { $in: v.split(",") },
      }),
      shadeMaterial: (v) => ({
        "specifications.shadeMaterial": { $in: v.split(",") },
      }),
      switchType: (v) => ({
        "specifications.switchType": { $in: v.split(",") },
      }),
      brightness: (v) => ({
        "specifications.brightness": { $in: v.split(",") },
      }),
      lightingMethod: (v) => ({
        "specifications.lightingMethod": { $in: v.split(",") },
      }),
      controlType: (v) => ({
        "specifications.controlType": { $in: v.split(",") },
      }),
      controlMethod: (v) => ({
        "specifications.controlMethod": { $in: v.split(",") },
      }),
      bulbShapeSize: (v) => ({
        "specifications.bulbShapeSize": { $in: v.split(",") },
      }),
      bulbBase: (v) => ({ "specifications.bulbBase": { $in: v.split(",") } }),
      lightColor: (v) => ({
        "specifications.lightColor": { $in: v.split(",") },
      }),
      capacity: (v) => ({ "specifications.capacity": { $in: v.split(",") } }),
      cutType: (v) => ({ "specifications.cutType": { $in: v.split(",") } }),
      telephoneType: (v) => ({
        "specifications.telephoneType": { $in: v.split(",") },
      }),
      powerSource: (v) => ({
        "specifications.powerSource": { $in: v.split(",") },
      }),
      answeringSystemType: (v) => ({
        "specifications.answeringSystemType": { $in: v.split(",") },
      }),
      supportedInternetServices: (v) => ({
        "specifications.supportedInternetServices": { $in: v.split(",") },
      }),
      memoryStorageCapacity: (v) => ({
        "specifications.memoryStorageCapacity": { $in: v.split(",") },
      }),
      wirelessCarrier: (v) => ({
        "specifications.wirelessCarrier": { $in: v.split(",") },
      }),
      formFactor: (v) => ({
        "specifications.formFactor": { $in: v.split(",") },
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
