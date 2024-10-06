import { Document, Types } from "mongoose";
import { ProductDoc } from "./productModel";
import { ProductVariantsDoc } from "./productVariantsModel";
export interface WishlistItemDoc extends Document {
    product: Types.ObjectId | ProductDoc;
    variant: ProductVariantsDoc;
    sku: string;
}
export interface WishlistDoc extends Document {
    userId: Types.ObjectId;
    items: Types.DocumentArray<WishlistItemDoc>;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Wishlist: import("mongoose").Model<WishlistDoc, {}, {}, {}, Document<unknown, {}, WishlistDoc> & WishlistDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>;
export default Wishlist;
