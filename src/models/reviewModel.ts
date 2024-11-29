import { Document, Schema, Types, model } from "mongoose";

// Define the interface for Review document
export interface ReviewDoc extends Document {
  rating: number;
  comment: string;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
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

const Review = model<ReviewDoc>("Review", ReviewSchema);

export default Review;
