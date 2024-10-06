import { Document, Types, Model } from "mongoose";
export interface ReviewDoc extends Document {
    rating: number;
    comment: string;
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ReviewModel extends Model<ReviewDoc> {
    updateProductReview(productId: unknown): Promise<void>;
}
declare const Review: ReviewModel;
export default Review;
