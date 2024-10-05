import { Document, Schema, Types, model } from "mongoose";
import { type ImageUrls } from "../@types/types";

// Define the interface for Category document
export interface CategoryDoc extends Document {
  name: string;
  image?: ImageUrls;
  description?: string;
  parentCategoryId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for Category
const CategorySchema = new Schema<CategoryDoc>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "ParentCategory",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Modify the virtual field definition
CategorySchema.virtual("parentCategory", {
  ref: "ParentCategory",
  localField: "parentCategoryId",
  foreignField: "_id",
  justOne: true,
});

const Category = model<CategoryDoc>("Category", CategorySchema);

export default Category;
