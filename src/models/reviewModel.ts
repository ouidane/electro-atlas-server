import { Document, Schema, Types, Model, model } from "mongoose";

// Define the interface for Review document
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

// Create the schema for Review
const ReviewSchema = new Schema<ReviewDoc>(
  {
    rating: {
      type: Number,
      validate: {
        validator: (value: number) => {
          return Number.isInteger(value) && value >= 1 && value <= 5;
        },
        message: "Invalid rating",
      },
      required: [true, "rating is required"],
    },
    comment: {
      type: String,
      required: [true, "comment is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Modify the virtual field definition
ReviewSchema.virtual("user", {
  ref: "Profile",
  localField: "userId",
  foreignField: "userId",
  justOne: true,
});

ReviewSchema.statics.updateProductReview = async function (
  productId: Types.ObjectId
): Promise<void> {
  const Product = model("Product");
  const product = await Product.findById(productId);

  const Review = this as Model<ReviewDoc>;
  const reviews = await Review.find({ productId });

  // Calculate total number of reviews and total rating
  const totalReviews = reviews.length;
  let totalRating = 0;

  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  // Update product's review fields
  product.reviews.numOfReviews = totalReviews;

  // Calculate precise average rating
  const preciseAverageRating =
    totalReviews > 0 ? totalRating / totalReviews : 0;
  product.reviews.averageRating = parseFloat(preciseAverageRating.toFixed(2));
  product.reviews.roundedAverage = Math.round(preciseAverageRating);

  await product.save();
};

const Review = model<ReviewDoc, ReviewModel>("Review", ReviewSchema);

export default Review;
