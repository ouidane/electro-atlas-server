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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChildCategory = exports.updateChildCategory = exports.createChildCategory = exports.getSingleChildCategory = exports.getChildCategories = exports.deleteParentCategory = exports.updateParentCategory = exports.createParentCategory = exports.getSingleParentCategory = exports.getParentCategories = void 0;
const models_1 = require("../models");
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = require("../utils/cloudinary");
const sortHandler_1 = require("../utils/sortHandler");
// Get all parent categories
const getParentCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, sort = "createdAt", page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page) || 10;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const queryObject = {};
    if (name) {
        queryObject.name = { $regex: new RegExp(name.toString(), "i") };
    }
    const AllowedSortFields = {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        name: "name",
    };
    const sortCriteria = (0, sortHandler_1.buildSortOption)(sort, AllowedSortFields);
    const parentCategories = yield models_1.ParentCategory.find(queryObject)
        .select("-__v")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNumber)
        .lean();
    const totalCategories = yield models_1.ParentCategory.countDocuments(queryObject);
    res.status(200).json({
        parentCategories,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCategories / limitNumber),
            totalCategories: totalCategories,
            limit: limitNumber,
        },
    });
});
exports.getParentCategories = getParentCategories;
// Get single parent category
const getSingleParentCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parentCategoryId = req.params.parentCategoryId;
    const parentCategory = yield models_1.ParentCategory.findById(parentCategoryId)
        .select("-__v")
        .lean();
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Parent category not found"));
    }
    res.status(200).json({ parentCategory });
});
exports.getSingleParentCategory = getSingleParentCategory;
const createParentCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const image = req.file;
    let parentCategory = yield models_1.ParentCategory.create({ name, description });
    if (!parentCategory) {
        return next((0, http_errors_1.default)(500, "Failed to create category"));
    }
    if (image) {
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = "data:" + image.mimetype + ";base64," + b64;
        // Await the result of uploadToCloudinary
        const result = yield (0, cloudinary_1.uploadToCloudinary)(dataURI, "nwmuofs9", `category_${parentCategory._id}`);
        const imageUrls = (0, cloudinary_1.generateImageUrls)(result.public_id);
        // Update the category with image URLs
        parentCategory.image = imageUrls;
        yield parentCategory.save();
    }
    return res.status(201).json({ message: "Category created." });
});
exports.createParentCategory = createParentCategory;
// Function to update a category
const updateParentCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentCategoryId } = req.params;
    const { name, description } = req.body;
    const image = req.file;
    let parentCategory = yield models_1.ParentCategory.findByIdAndUpdate(parentCategoryId, { name, description }, { new: true });
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Category not found"));
    }
    if (image) {
        if (parentCategory.image && parentCategory.image.publicId) {
            // Delete the image from Cloudinary
            yield (0, cloudinary_1.destroyImage)(parentCategory.image.publicId);
        }
        // Handle image update if a new file is present
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = "data:" + image.mimetype + ";base64," + b64;
        // Await the result of uploadToCloudinary
        const result = yield (0, cloudinary_1.uploadToCloudinary)(dataURI, "nwmuofs9", `category_${parentCategory._id}`);
        const imageUrls = (0, cloudinary_1.generateImageUrls)(result.public_id);
        // Update the category with new image URLs
        parentCategory.image = imageUrls;
        yield parentCategory.save();
    }
    return res.status(200).json({ message: "Category updated." });
});
exports.updateParentCategory = updateParentCategory;
// Function to delete a category
const deleteParentCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentCategoryId } = req.params;
    const parentCategory = yield models_1.ParentCategory.findById(parentCategoryId);
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Category not found"));
    }
    if (parentCategory.image && parentCategory.image.publicId) {
        // Delete the image from Cloudinary
        yield (0, cloudinary_1.destroyImage)(parentCategory.image.publicId);
    }
    yield models_1.ParentCategory.findByIdAndDelete(parentCategoryId);
    return res.status(200).json({ message: "Category deleted." });
});
exports.deleteParentCategory = deleteParentCategory;
// Get all child categories
const getChildCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentCategoryId } = req.params;
    const { name, sort = "createdAt", page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    // Build the query object
    const queryObject = { parentCategoryId };
    if (name)
        queryObject.name = { $regex: new RegExp(name, "i") };
    const AllowedSortFields = {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        name: "name",
    };
    const sortCriteria = (0, sortHandler_1.buildSortOption)(sort, AllowedSortFields);
    const childCategories = yield models_1.Category.find(queryObject)
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
        return next((0, http_errors_1.default)(404, "Categories not found"));
    }
    // Get total count for pagination
    const totalCount = yield models_1.Category.countDocuments(queryObject);
    res.status(200).json({
        childCategories,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalCount,
            limit: limitNumber,
        },
    });
});
exports.getChildCategories = getChildCategories;
// Get single child category
const getSingleChildCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { childCategoryId, parentCategoryId } = req.params;
    const childCategory = yield models_1.Category.findOne({
        _id: childCategoryId,
        parentCategoryId,
    })
        .select("-__v")
        .lean();
    if (!childCategory) {
        return next((0, http_errors_1.default)(404, "Child category not found"));
    }
    res.status(200).json({ childCategory });
});
exports.getSingleChildCategory = getSingleChildCategory;
const createChildCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentCategoryId } = req.params;
    const { name, description } = req.body;
    const image = req.file;
    const parentCategory = yield models_1.ParentCategory.findById(parentCategoryId).lean();
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Parent category not found"));
    }
    let childCategory = yield models_1.Category.create({
        name,
        description,
        parentCategoryId,
    });
    if (!childCategory) {
        return next((0, http_errors_1.default)(500, "Failed to create category"));
    }
    if (image) {
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = "data:" + image.mimetype + ";base64," + b64;
        // Await the result of uploadToCloudinary
        const result = yield (0, cloudinary_1.uploadToCloudinary)(dataURI, "nwmuofs9", `category_${childCategory._id}`);
        const imageUrls = (0, cloudinary_1.generateImageUrls)(result.public_id);
        // Update the category with image URLs
        childCategory.image = imageUrls;
        yield childCategory.save();
    }
    return res.status(201).json({ message: "Category created." });
});
exports.createChildCategory = createChildCategory;
// Function to update a category
const updateChildCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { childCategoryId, parentCategoryId } = req.params;
    const { name, description } = req.body;
    const image = req.file;
    const parentCategory = yield models_1.ParentCategory.findById(parentCategoryId).lean();
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Parent category not found"));
    }
    let childCategory = yield models_1.Category.findByIdAndUpdate(childCategoryId, { name, description, parentCategoryId }, { new: true });
    if (!childCategory) {
        return next((0, http_errors_1.default)(404, "Category not found"));
    }
    if (image) {
        if (childCategory.image && childCategory.image.publicId) {
            // Delete the image from Cloudinary
            yield (0, cloudinary_1.destroyImage)(childCategory.image.publicId);
        }
        // Handle image update if a new file is present
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = "data:" + image.mimetype + ";base64," + b64;
        // Await the result of uploadToCloudinary
        const result = yield (0, cloudinary_1.uploadToCloudinary)(dataURI, "nwmuofs9", `category_${childCategory._id}`);
        const imageUrls = (0, cloudinary_1.generateImageUrls)(result.public_id);
        // Update the category with new image URLs
        childCategory.image = imageUrls;
        yield childCategory.save();
    }
    return res.status(200).json({ message: "Category updated." });
});
exports.updateChildCategory = updateChildCategory;
// Function to delete a category
const deleteChildCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { childCategoryId, parentCategoryId } = req.params;
    const parentCategory = yield models_1.ParentCategory.findById(parentCategoryId);
    if (!parentCategory) {
        return next((0, http_errors_1.default)(404, "Parent category not found"));
    }
    const childCategory = yield models_1.Category.findById(childCategoryId);
    if (!childCategory) {
        return next((0, http_errors_1.default)(404, "Category not found"));
    }
    if (childCategory.image && childCategory.image.publicId) {
        // Delete the image from Cloudinary
        yield (0, cloudinary_1.destroyImage)(childCategory.image.publicId);
    }
    yield models_1.Category.findByIdAndDelete(childCategoryId);
    return res.status(200).json({ message: "Category deleted." });
});
exports.deleteChildCategory = deleteChildCategory;
//# sourceMappingURL=categoryController.js.map