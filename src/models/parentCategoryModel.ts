import { Document, Schema, model } from "mongoose";
import { CategoryDoc } from "./categoryModel";
import { type ImageUrls } from "../types/types";

// Define the interface for Category document
export interface ParentCategoryDoc extends Document {
  name: string;
  image?: ImageUrls;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for ParentCategory
const ParentCategorySchema = new Schema<ParentCategoryDoc>(
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
  },
  { timestamps: true }
);

// Define a pre-hook to delete associated category before deleting a parent category
ParentCategorySchema.pre("deleteOne", async function (next) {
  const { _id: parentCategoryId } = this.getQuery();

  const Category = model<CategoryDoc>("Category");
  if (Category) {
    await Category.deleteMany({ parentCategoryId });
  }

  next();
});

const ParentCategory = model<ParentCategoryDoc>(
  "ParentCategory",
  ParentCategorySchema
);
export default ParentCategory;
