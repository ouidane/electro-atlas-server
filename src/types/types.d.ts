import { ProductVariantsDoc } from "../models/productVariantsModel";
import { PLATFORMS, ROLE } from "../utils/constants";
import { Types } from "mongoose";

export interface IUserData {
  platform: (typeof PLATFORMS)[keyof typeof PLATFORMS];
  role: (typeof ROLE)[keyof typeof ROLE];
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IUserUpdateData {
  familyName?: string;
  givenName?: string;
  phone?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  line1?: string;
  line2?: string;
  postalCode?: string;
  country?: string;
  city?: string;
  description?: string;
  password?: string;
  role?: string;
}

export interface IUserQueryParams {
  pageNumber: number;
  sort: string;
  skip: number;
  filters: { [key: string]: string };
  limitNumber: number;
}

export type ProductData = {
  [key: string]: any;
};

export type ImageUrls = {
  publicId: string;
  tiny: string;
  medium: string;
  large: string;
};

export type FormattedItem = {
  itemId: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  productId: Types.ObjectId;
  productName: string;
  sellerId: Types.ObjectId;
  image?: string;
  variant: ProductVariantsDoc;
  createdAt: 1;
  updatedAt: 1;
};

export type StockCheckResult = {
  isAvailable: boolean;
  unavailableItems: UnavailableItem[];
};

export type UnavailableItem = {
  productId: string;
  sku: string;
  reason: string;
};
