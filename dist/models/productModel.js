"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productVariantsModel_1 = require("./productVariantsModel");
const productSpecificationsModel_1 = require("./productSpecificationsModel");
// Create the schema for Product
const ProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
        uppercase: true,
        required: [true, "Please provide product name"],
        maxlength: [100, "Name can not be more than 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Please provide product description"],
        maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    brand: {
        type: String,
        trim: true,
        uppercase: true,
        required: [true, "Please provide product brand"],
    },
    color: {
        type: String,
    },
    images: [
        {
            publicId: {
                type: String,
            },
            tiny: {
                type: String,
            },
            medium: {
                type: String,
            },
            large: {
                type: String,
            },
        },
    ],
    reviews: {
        averageRating: {
            type: Number,
            default: 0,
        },
        roundedAverage: {
            type: Number,
            default: 0,
        },
        numOfReviews: {
            type: Number,
            default: 0,
        },
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    parentCategoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ParentCategory",
        required: true,
    },
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    popularity: {
        type: Number,
        default: 0,
    },
    salesCount: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    variants: [productVariantsModel_1.ProductVariantsSchema],
    specifications: productSpecificationsModel_1.ProductSpecificationsSchema,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Modify the virtual field definition
ProductSchema.virtual("seller", {
    ref: "Profile",
    localField: "sellerId",
    foreignField: "userId",
    justOne: true,
});
const Product = (0, mongoose_1.model)("Product", ProductSchema);
exports.default = Product;
//# sourceMappingURL=productModel.js.map