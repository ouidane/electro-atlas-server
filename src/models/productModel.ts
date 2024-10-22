import { Document, Schema, Types, model } from "mongoose";
import {
  ProductVariantsDoc,
  ProductVariantsSchema,
} from "./productVariantsModel";
import {
  ProductSpecificationsDoc,
  ProductSpecificationsSchema,
} from "./productSpecificationsModel";
import { type ImageUrls } from "../types/types";

// Define the interface for Product document
export interface ProductDoc extends Document {
  name: string;
  description?: string;
  brand: string;
  color: string;
  images?: ImageUrls[];
  reviews: {
    averageRating: number;
    rawAverageRating: number;
    numOfReviews: number;
  };
  categoryId: Types.ObjectId;
  parentCategoryId: Types.ObjectId;
  sellerId: Types.ObjectId;
  popularity: number;
  salesCount: number;
  isFeatured: boolean;
  variants: ProductVariantsDoc[];
  specifications: ProductSpecificationsDoc;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for Product
const ProductSchema = new Schema<ProductDoc>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "ParentCategory",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
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
    variants: [ProductVariantsSchema],
    specifications: ProductSpecificationsSchema,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Modify the virtual field definition
ProductSchema.virtual("seller", {
  ref: "Profile",
  localField: "sellerId",
  foreignField: "userId",
  justOne: true,
});

const Product = model<ProductDoc>("Product", ProductSchema);

export default Product;
