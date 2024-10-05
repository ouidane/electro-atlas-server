import { ProductVariantsDoc } from "../models/productVariantsModel";
import { Types } from "mongoose";

export interface ImageUrls {
  publicId: string;
  tiny: string;
  medium: string;
  large: string;
}

export interface FormattedItem {
  itemId: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  productId: Types.ObjectId;
  productName: string;
  sellerId: Types.ObjectId;
  image?: string;
  variant: ProductVariantsDoc,
  createdAt: 1,
  updatedAt: 1,
}

export interface StockCheckResult {
  isAvailable: boolean;
  unavailableItems: UnavailableItem[];
}

export interface UnavailableItem {
  productId: string;
  sku: string;
  reason: string;
}
