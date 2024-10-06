import { Document } from "mongoose";
import { type ImageUrls } from "../@types/types";
export interface ParentCategoryDoc extends Document {
    name: string;
    image?: ImageUrls;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const ParentCategory: import("mongoose").Model<ParentCategoryDoc, {}, {}, {}, Document<unknown, {}, ParentCategoryDoc> & ParentCategoryDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>;
export default ParentCategory;
