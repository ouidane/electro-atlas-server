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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Create the schema for ParentCategory
const ParentCategorySchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Define a pre-hook to delete associated category before deleting a parent category
ParentCategorySchema.pre("deleteOne", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id: parentCategoryId } = this.getQuery();
        const Category = (0, mongoose_1.model)("Category");
        if (Category) {
            yield Category.deleteMany({ parentCategoryId });
        }
        next();
    });
});
const ParentCategory = (0, mongoose_1.model)("ParentCategory", ParentCategorySchema);
exports.default = ParentCategory;
//# sourceMappingURL=parentCategoryModel.js.map