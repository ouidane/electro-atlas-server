import { Document, Types } from "mongoose";
import { ProductVariantsDoc } from "./productVariantsModel";
import { ProductSpecificationsDoc } from "./productSpecificationsModel";
import { type ImageUrls } from "../@types/types";
export interface ProductDoc extends Document {
    name: string;
    description: string;
    brand: string;
    color?: string;
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
declare const Product: import("mongoose").Model<ProductDoc, {}, {}, {}, Document<unknown, {}, ProductDoc> & ProductDoc & Required<{
    _id: unknown;
}>, any>;
export default Product;
