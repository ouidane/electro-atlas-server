import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Review, Product } from "../models";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { rating, comment } = req.body;
  const { productId } = req.params;
  const userId = req.user.id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(createError(404, "Product not found"));
  }

  const newReview = new Review({
    rating,
    comment,
    userId,
    productId,
  });

  await newReview.save();

  // Update product's review details
  await Review.updateProductReview(product._id);

  res.status(201).json({ message: "Review created" });
};

const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const pageNumber = parseInt(page as string) || 10;
  const limitNumber = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const product = await Product.findById(productId);
  if (!product) {
    return next(createError(404, "Product not found"));
  }

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

  res.status(200).json({
    reviews,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
      totalReviews: totalReviews,
      limit: limitNumber,
    },
  });
};

const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { reviewId, productId } = req.params;

  const review = await Review.findOne({ _id: reviewId, productId })
    .populate({
      path: "user",
      select: "-_id name userId",
      options: { lean: true },
    })
    .select("rating comment user productId createdAt updatedAt")
    .lean();

  if (!review) {
    return next(createError(404, "Review not found"));
  }

  res.status(200).json({ review });
};

const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { reviewId, productId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId, productId });
  if (!review) {
    return next(createError(404, "Review not found"));
  }

  review.rating = rating;
  review.comment = comment;

  await review.save();

  // Update product's review details
  await Review.updateProductReview(review.productId);

  res.status(200).json({ message: "Review updated" });
};

const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { reviewId, productId } = req.params;

  const review = await Review.findOneAndDelete({ _id: reviewId, productId });
  if (!review) {
    return next(createError(404, "Review not found"));
  }

  // Update product's review details
  await Review.updateProductReview(review.productId);

  res.status(200).json({ message: "Review deleted" });
};

export { getReviews, createReview, getReviewById, updateReview, deleteReview };
