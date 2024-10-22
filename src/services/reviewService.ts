import createError from "http-errors";
import { Review, Product } from "../models";

export class ReviewService {
  async createReview(
    productId: string,
    userId: string,
    rating: number,
    comment: string
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw createError(404, "Product not found");
    }

    const newReview = new Review({
      rating,
      comment,
      userId,
      productId,
    });

    await newReview.save();
    await Review.updateProductReview(product._id);

    return { message: "Review created" };
  }

  async getReviews(productId: string, page: string, limit: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw createError(404, "Product not found");
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const reviews = await Review.find({ productId })
      .populate({
        path: "user",
        select: "-_id familyName givenName userId",
        options: { lean: true },
      })
      .select("-__v")
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalReviews = await Review.countDocuments({ productId });

    return {
      reviews,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalReviews / limitNumber),
        totalReviews: totalReviews,
        limit: limitNumber,
      },
    };
  }

  async getReviewById(reviewId: string, productId: string) {
    const review = await Review.findOne({ _id: reviewId, productId })
      .populate({
        path: "user",
        select: "-_id name userId",
        options: { lean: true },
      })
      .select("rating comment user productId createdAt updatedAt")
      .lean();

    if (!review) {
      throw createError(404, "Review not found");
    }

    return review;
  }

  async updateReview(
    reviewId: string,
    productId: string,
    rating: number,
    comment: string
  ) {
    const review = await Review.findOne({ _id: reviewId, productId });
    if (!review) {
      throw createError(404, "Review not found");
    }

    review.rating = rating;
    review.comment = comment;

    await review.save();
    await Review.updateProductReview(review.productId);

    return { message: "Review updated" };
  }

  async deleteReview(reviewId: string, productId: string) {
    const review = await Review.findOneAndDelete({ _id: reviewId, productId });
    if (!review) {
      throw createError(404, "Review not found");
    }

    await Review.updateProductReview(review.productId);

    return { message: "Review deleted" };
  }
}

export default new ReviewService();
