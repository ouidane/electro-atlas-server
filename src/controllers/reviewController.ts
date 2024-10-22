import { Request, Response, NextFunction } from "express";
import reviewService from "../services/reviewService";

class ReviewController {
  async createReview(req: Request, res: Response) {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await reviewService.createReview(
      productId,
      userId,
      rating,
      comment
    );
    res.status(201).json(result);
  }

  async getReviews(req: Request, res: Response) {
    const { productId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const result = await reviewService.getReviews(
      productId,
      page as string,
      limit as string
    );
    res.status(200).json(result);
  }

  async getReviewById(req: Request, res: Response) {
    const { reviewId, productId } = req.params;

    const review = await reviewService.getReviewById(reviewId, productId);
    res.status(200).json({ review });
  }

  async updateReview(req: Request, res: Response) {
    const { reviewId, productId } = req.params;
    const { rating, comment } = req.body;

    const result = await reviewService.updateReview(
      reviewId,
      productId,
      rating,
      comment
    );
    res.status(200).json(result);
  }

  async deleteReview(req: Request, res: Response) {
    const { reviewId, productId } = req.params;

    const result = await reviewService.deleteReview(reviewId, productId);
    res.status(200).json(result);
  }
}

export const reviewController = new ReviewController();
