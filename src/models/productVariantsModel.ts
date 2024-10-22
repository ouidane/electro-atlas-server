import { Document, Schema } from "mongoose";

export interface ProductVariantsDoc extends Document {
  variation: string;
  sku: string;
  inventory: number;
  globalPrice: number;
  salePrice: number;
  discountPercent: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
}

export const ProductVariantsSchema = new Schema<ProductVariantsDoc>({
  variation: {
    type: String,
    required: [true, "variation is required"],
  },
  sku: {
    type: String,
    required: [true, "SKU is required"],
    unique: true,
  },
  inventory: {
    type: Number,
    required: [true, "inventory is required"],
    min: [0, "inventory must be a positive number"],
  },
  globalPrice: {
    type: Number,
    required: [true, "globalPrice is required"],
    min: [0, "globalPrice must be a positive number"],
  },
  salePrice: {
    type: Number,
    min: [0, "salePrice must be a positive number"],
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  saleStartDate: {
    type: Date,
    default: Date.now,
  },
  saleEndDate: {
    type: Date,
    validate: {
      validator: function (value: Date) {
        return !this.saleStartDate || value > this.saleStartDate;
      },
      message: "saleEndDate must be after saleStartDate",
    },
  },
});
