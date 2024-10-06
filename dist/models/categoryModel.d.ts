import { Document, Types } from "mongoose";
import { type ImageUrls } from "../@types/types";
export interface CategoryDoc extends Document {
    name: string;
    image?: ImageUrls;
    description?: string;
    parentCategoryId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Category: import("mongoose").Model<CategoryDoc, {}, {}, {}, Document<unknown, {}, CategoryDoc> & CategoryDoc & Required<{
    _id: unknown;
}>, any>;
export default Category;
