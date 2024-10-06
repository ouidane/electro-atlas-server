"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const models_1 = require("../models");
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("../utils/cloudinary");
const sortHandler_1 = require("../utils/sortHandler");
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.query, { limit, page, sort } = _a, filters = __rest(_a, ["limit", "page", "sort"]);
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
    const queryObject = {}; // Initialize empty query object
    const filterHandlers = {
        color: (value) => ({ $in: value.split(",") }),
        brand: (value) => ({ $in: value.split(",") }),
        query: (value) => ({ name: { $regex: new RegExp(value, "i") } }),
        sellerId: (value) => ({
            sellerId: new mongoose_1.default.Types.ObjectId(value),
        }),
        categoryId: (value) => ({
            categoryId: new mongoose_1.default.Types.ObjectId(value),
        }),
        parentCategoryId: (value) => ({
            parentCategoryId: new mongoose_1.default.Types.ObjectId(value),
        }),
        lowestPrice: (value) => ({
            "variants.salePrice": { $gte: parseInt(value) },
        }),
        highestPrice: (value) => ({
            "variants.salePrice": { $lte: parseInt(value) },
        }),
    };
    for (const [key, value] of Object.entries(filters)) {
        if (key in filterHandlers) {
            Object.assign(queryObject, filterHandlers[key](value));
        }
        else if (specifications.includes(key)) {
            queryObject[`specifications.${key}`] = {
                $in: value.split(","),
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
    const sortCriteria = (0, sortHandler_1.buildSortOption)(sort, AllowedSortFields);
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield models_1.Product.aggregate([
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
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const product = yield models_1.Product.findById(productId).populate("seller");
    if (!product) {
        return next((0, http_errors_1.default)(404, "Product not found"));
    }
    res.status(200).json({ product });
});
exports.getProductById = getProductById;
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sellerId = req.user.id;
    const { name, description, brand, color, categoryId, parentCategoryId, variants, specifications, } = req.body;
    const childCategory = yield models_1.Category.findById(categoryId);
    if (!childCategory) {
        return next((0, http_errors_1.default)(404, "Category not found"));
    }
    const parentCategory = yield models_1.ParentCategory.findById(categoryId);
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Category not found"));
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
    const product = yield models_1.Product.create(productData);
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        let productImages = [];
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;
            const randomStr = Math.random().toString(36).substring(2, 8);
            // Await the result of uploadToCloudinary
            const result = yield (0, cloudinary_1.uploadToCloudinary)(dataURI, "r7skmjh9", `product_${randomStr}_${product._id}`);
            const productImagesUrls = (0, cloudinary_1.generateImageUrls)(result.public_id);
            productImages.push(productImagesUrls);
        }
        // Update the product with images URLs
        product.images = productImages;
        yield product.save();
    }
    res.status(200).json({ message: "product created" });
});
exports.createProduct = createProduct;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { imagesToDelete, reorderedImages, name, description, brand, color, categoryId, parentCategoryId, variants, specifications, } = req.body;
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
    const product = yield models_1.Product.findByIdAndUpdate(productId, productData);
    if (!product) {
        return next((0, http_errors_1.default)(404, "Product not found"));
    }
    // Delete the images from database and from Cloudinary
    if (imagesToDelete && imagesToDelete.length > 0) {
        for (let i = 0; i < imagesToDelete.length; i++) {
            product.images = product.images.filter((img) => img.publicId !== imagesToDelete[i]);
        }
        // Delete the images from Cloudinary
        yield Promise.all(imagesToDelete.map((imagePublicId) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, cloudinary_1.destroyImage)(imagePublicId);
        })));
    }
    if (reorderedImages && reorderedImages.length === product.images.length) {
        let arrangedImages = [];
        for (let i = 0; i < reorderedImages.length; i++) {
            const publicId = product.images.find((img) => img.publicId === reorderedImages[i]);
            if (!publicId) {
                return next((0, http_errors_1.default)(404, "Image publicId not found"));
            }
            arrangedImages.push(publicId);
        }
        // Update the product with images URLs
        product.images = arrangedImages;
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Check total images limit
        const existingImagesCount = product.images.length;
        const newImagesCount = req.files ? req.files.length : 0;
        const totalImagesCount = existingImagesCount + newImagesCount;
        if (totalImagesCount > 10) {
            return next((0, http_errors_1.default)(400, "Total number of images cannot exceed 10."));
        }
        let productImages = [];
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;
            const randomStr = Math.random().toString(36).substring(2, 8);
            // Upload To Cloudinary
            const result = yield (0, cloudinary_1.uploadToCloudinary)(dataURI, "r7skmjh9", `product_${randomStr}_${product._id}`);
            const productImagesUrls = (0, cloudinary_1.generateImageUrls)(result.public_id);
            productImages.push(productImagesUrls);
        }
        // Update the product with images URLs
        product.images.push(...productImages);
        yield product.save();
    }
    res.status(200).json({ message: "product updated" });
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const product = yield models_1.Product.findById(productId);
    if (!product) {
        return next((0, http_errors_1.default)(404, "product not found"));
    }
    if (product.images) {
        yield Promise.all(product.images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
            // Delete the image from Cloudinary
            yield (0, cloudinary_1.destroyImage)(image.publicId);
        })));
    }
    yield models_1.Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "product deleted" });
});
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map