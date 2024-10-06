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
export declare const ProductVariantsSchema: Schema<ProductVariantsDoc, import("mongoose").Model<ProductVariantsDoc, any, any, any, Document<unknown, any, ProductVariantsDoc> & ProductVariantsDoc & Required<{
    _id: unknown;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductVariantsDoc, Document<unknown, {}, import("mongoose").FlatRecord<ProductVariantsDoc>> & import("mongoose").FlatRecord<ProductVariantsDoc> & Required<{
    _id: unknown;
}>>;
