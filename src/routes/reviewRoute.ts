import express, { Router } from "express";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import {
  authenticateUser,
  authorizeReviewAccess,
} from "../middleware/premissions";

const router: Router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getReviews)
  .post(authenticateUser, createReview);

router
  .route("/:reviewId")
  .get(getReviewById)
  .patch(authenticateUser, authorizeReviewAccess, updateReview)
  .delete(authenticateUser, authorizeReviewAccess, deleteReview);

export default router;
