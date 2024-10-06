"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Create the schema for Category
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        lowercase: true,
    },
    image: {
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
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description is too long"],
    },
    parentCategoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ParentCategory",
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
// Modify the virtual field definition
CategorySchema.virtual("parentCategory", {
    ref: "ParentCategory",
    localField: "parentCategoryId",
    foreignField: "_id",
    justOne: true,
});
const Category = (0, mongoose_1.model)("Category", CategorySchema);
exports.default = Category;
//# sourceMappingURL=categoryModel.js.map