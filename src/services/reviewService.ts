import createError from "http-errors";
import { Review, Product } from "../models";
import { Types } from "mongoose";

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
    await this.updateProductReview(productId);

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

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ productId })
        .populate({
          path: "user",
          select: "-_id familyName givenName userId",
          options: { lean: true },
        })
        .select("-__v")
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Review.countDocuments({ productId }),
    ]);

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
    await this.updateProductReview(productId);

    return { message: "Review updated" };
  }

  async deleteReview(reviewId: string, productId: string) {
    const review = await Review.findOneAndDelete({ _id: reviewId, productId });
    if (!review) {
      throw createError(404, "Review not found");
    }

    await this.updateProductReview(productId);

    return { message: "Review deleted" };
  }

  private async updateProductReview(productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw createError(404, "Product not found");
    }

    const reviews = await Review.find({ productId });

    // Calculate total number of reviews and total rating
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      product.reviews.numOfReviews = 0;
      product.reviews.averageRating = 0;
      product.reviews.rawAverageRating = 0;
      await product.save();
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Update product's review fields
    product.reviews.numOfReviews = totalReviews;
    product.reviews.averageRating = parseFloat(averageRating.toFixed(2));
    product.reviews.rawAverageRating = Math.round(averageRating);

    await product.save();
  }
}

export default new ReviewService();
